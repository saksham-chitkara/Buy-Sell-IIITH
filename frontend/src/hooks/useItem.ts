import { useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useItem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const getItem = async (id: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/items/${id}`);
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to fetch item",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive",
      });
      return null;
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const checkItemInCart = async (itemId: string) => {
    try {
      const { data } = await api.get(`/cart/check/${itemId}`);
      return data.inCart;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const isOwnItem = (sellerEmail: string) => {
    return user?.email === sellerEmail;
  };

  return {
    getItem,
    checkItemInCart,
    isOwnItem,
    isLoading,
  };
};
