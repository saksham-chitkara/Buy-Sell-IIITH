import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  itemId: string; // Adding itemId property
  name: string;
  price: number;
  bargainedPrice: number | null;
  quantity: number;
  image: any; // Cloudinary image
  seller: {
    name: string;
    email: string;
  };
  bargainStatus: string;
}

export const useCart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = async (itemId: string, quantity: number = 1) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/cart", { itemId, quantity });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
      // Refresh cart items after adding
      await getCart();
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to add item",
        description: error.response?.data?.message || "An error occurred while adding item to cart",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const getCart = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/cart");

      // fetch seller details
      const sellerIDs = data.map((item: any) => item.item.seller);
      const sellers: { [key: string]: any } = {};

      // Fetch seller details
      await Promise.all(
        sellerIDs.map(async (id: string) => {
          if (!sellers[id]) {
            const { data } = await api.get(`/users/${id}`);
            sellers[id] = data;
          }
        })
      );

      // Transform backend data to match frontend interface
      const cartItems = data.map((item: any) => ({
        id: item._id,
        itemId: item.item._id, // Adding itemId property
        name: item.item.name,
        price: item.item.price,
        bargainedPrice:
          item.bargainRequest?.status === "ACCEPTED"
            ? item.bargainRequest.price
            : null,
        quantity: item.quantity,
        image: item.item.images[0], // Assuming first image is main
        seller: {
          
          name: `${sellers[item.item.seller].user.firstName} ${
            sellers[item.item.seller].user.lastName
          }`,
          email: sellers[item.item.seller].user.email,
        },
        bargainStatus: item.bargainRequest?.status || "NONE",
      }));
      
      // Update items state
      setItems(cartItems);
      return cartItems;
    } catch (error: any) {
      toast({
        title: "Failed to fetch cart",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive",
      });
      return [];
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
      // Refresh cart items after removing
      await getCart();
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to remove item",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
      return false;
    }
  };

  const bargainItem = async (
    itemId: string,
    price: number,
    message: string
  ) => {
    try {
      await api.post(`/cart/${itemId}/bargain`, {
        price,
        message,
      });
      toast({
        title: "Bargain request sent",
        description: "The seller will be notified of your offer.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to send bargain request",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
      return false;
    }
  };

  const getCartCount = useCallback(async () => {
    try {
      const { data } = await api.get("/cart/count");
      return data.count;
    } catch (error: any) {
      toast({
        title: "Failed to fetch cart count",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
      return 0;
    }
  }, [toast]);

  // Add useEffect to load cart data on component mount
  useEffect(() => {
    // Only load cart if user is authenticated
    const token = localStorage.getItem("token");
    if (token) {
      getCart();
    }
  }, []);

  return {
    addToCart,
    getCart,
    removeFromCart,
    bargainItem,
    isLoading,
    getCartCount,
    items, // Include items in the return value
  };
};
