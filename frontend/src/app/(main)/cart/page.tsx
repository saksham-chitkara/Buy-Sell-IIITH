"use client";

import { Trash2, MessageSquare, RefreshCw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { getItemImageUrl, handleImageError } from "@/utils/image-helpers";


interface CartItem {
  id: string;
  itemId: string;
  name: string;
  price: number;
  bargainedPrice: number | null;
  quantity: number;
  image: string;
  stock: number;
  isAvailable: boolean;
  seller: {
    name: string;
    email: string;
  };
  bargainStatus: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED";
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [showBargainDialog, setShowBargainDialog] = useState(false);
  const [bargainPrice, setBargainPrice] = useState("");
  const [bargainMessage, setBargainMessage] = useState("");
  const [priceError, setPriceError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();
  const { getCart, bargainItem, isLoading, removeFromCart: cartHooksRemoveFromCart } = useCart();
  const { createOrder } = useOrders();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartItems = await getCart();
        if (cartItems) {
          setCartItems(cartItems);
          setError(null);
        }
      } catch (error) {
        setError("Failed to load cart items " + error);
      }
    };
    fetchCart();
  }, []);

  const removeFromCart = async (itemId: string) => {
    const success = await cartHooksRemoveFromCart(itemId);
    if (success) {
      // Refresh cart after removal
      const updatedCart = await getCart();
      if (updatedCart) {
        setCartItems(updatedCart);
      }
    }
  };

  const inititateBargain = (item: CartItem) => {
    setSelectedItem(item);
    setShowBargainDialog(true);
    setBargainPrice("");
    setBargainMessage("");
  };

  const handleBargainPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBargainPrice(value);
    
    if (!selectedItem) return;

    const numericPrice = parseFloat(value);
    if (numericPrice >= selectedItem.price) {
      setPriceError("Bargain price must be lower than the original price");
    } else if (numericPrice <= 0) {
      setPriceError("Price must be greater than 0");
    } else {
      setPriceError(null);
    }
  };

  const submitBargain = async () => {
    if (!selectedItem || !bargainPrice || !bargainMessage) return;

    const numericPrice = parseFloat(bargainPrice);
    if (numericPrice >= selectedItem.price) {
      setPriceError("Bargain price must be lower than the original price");
      return;
    }

    if (numericPrice <= 0) {
      setPriceError("Price must be greater than 0");
      return;
    }

    // Optimistically update UI
    const updatedItems = cartItems.map((item) =>
      item.id === selectedItem.id
        ? { ...item, bargainStatus: "PENDING" as const }
        : item
    );
    setCartItems(updatedItems);
    setShowBargainDialog(false);

    const success = await bargainItem(
      selectedItem.id,
      numericPrice,
      bargainMessage
    );

    if (!success) {
      // Revert optimistic update on failure
      const cartItems = await getCart();
      if (cartItems) {
        setCartItems(cartItems);
      }
    }
  };    const placeOrder = async () => {
    // Check for out-of-stock items
    const outOfStockItems = cartItems.filter(item => item.stock === 0);
    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.name).join(", ");
      toast({
        title: "Items Out of Stock",
        description: `The following items are out of stock: ${itemNames}. Please remove them from your cart to place the order.`,
        variant: "destructive",
      });
      return;
    }

    setIsOrdering(true);
    try {
      const result = await createOrder(
        cartItems.map((item) => item.id)
      );

      if (result) {
        setCartItems([]);
        toast({
          title: "Order placed successfully",
          description: "Check your orders page for OTP and delivery status.",
        });
        router.push("/orders");
      }
    } catch (error) {
      toast({
        title: "Failed to place order",
        description: "Please try again later (" + error + ")",
        variant: "destructive",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const getTotalCost = () => {
    return cartItems.reduce((total, item) => {
      const price = item.bargainedPrice ?? item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const refreshCart = async () => {
    try {
      const updatedCart = await getCart();
      if (updatedCart) {
        setCartItems(updatedCart);
        setError(null);
        toast({
          title: "Cart refreshed",
          description: "Your cart has been updated with the latest information.",
        });
      }
    } catch (error) {
      setError("Failed to refresh cart: " + error);
    }
  };

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-xl font-semibold text-red-600">{error}</h2>
        <Button onClick={refreshCart}>Try Again</Button>
      </div>
    );
  }

  if (!cartItems.length) {
    return <EmptyCart />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Shopping Cart</h1>
            </div>
            <Button
              onClick={refreshCart}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onRemove={removeFromCart}
                onBargain={inititateBargain}
              />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {/* Summary Details */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{getTotalCost()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items in cart</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="h-px bg-gray-200 my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{getTotalCost()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={placeOrder}
                disabled={isOrdering || cartItems.some(item => !item.isAvailable || item.stock === 0)}
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                {isOrdering ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Place Order"
                )}
              </Button>

              {/* Out of Stock Warning */}
              {cartItems.some(item => !item.isAvailable || item.stock === 0) && (
                <p className="mt-3 text-sm text-red-600 text-center">
                  Please remove unavailable or out of stock items before placing your order
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bargain Dialog */}
      <Dialog open={showBargainDialog} onOpenChange={setShowBargainDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
            <DialogDescription>
              Enter your desired price and a message to the seller
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Offer Price (₹)</label>
              <Input
                type="number"
                value={bargainPrice}
                onChange={handleBargainPriceChange}
                placeholder="Enter your offer"
              />
              {priceError && (
                <p className="text-sm text-red-500">{priceError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message to Seller</label>
              <Input
                value={bargainMessage}
                onChange={(e) => setBargainMessage(e.target.value)}
                placeholder="Why should the seller accept your offer?"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={submitBargain}
              disabled={!!priceError || !bargainPrice || !bargainMessage}
              className="bg-black hover:bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Send Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Components within the same file or can be separated into their own files

interface CartItemCardProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onBargain: (item: CartItem) => void;
}

const CartItemCard = ({ item, onRemove, onBargain }: CartItemCardProps) => {
  const router = useRouter();

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800 relative ${
      !item.isAvailable || item.stock === 0 ? 'opacity-75 border-red-500 border-2' : ''
    }`}>
      {(!item.isAvailable || item.stock === 0) && (
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
            {!item.isAvailable ? 'Unavailable' : 'Out of Stock'}
          </span>
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Item Image */}
          <div 
            onClick={() => router.push(`/explore/item/${item.itemId}`)}
            className="flex-shrink-0 relative w-full md:w-32 h-32 cursor-pointer overflow-hidden rounded-lg hover:opacity-80 transition-opacity"
          >
            <Image
              src={getItemImageUrl(item.image)}
              alt={item.name}
              fill
              onError={handleImageError}
              className="object-cover"
            />
          </div>

          {/* Item Details */}
          <div className="flex flex-col flex-1 gap-4">
            <div className="flex flex-col md:flex-row justify-between gap-2">
              <div>
                <h3 
                  className="text-xl font-semibold mb-1 hover:text-blue-600 cursor-pointer"
                  onClick={() => router.push(`/explore/item/${item.itemId}`)}
                >
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Seller: {item.seller.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.stock > 0 ? `${item.stock} in stock` : 'Currently out of stock'}
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1">
                {item.bargainedPrice !== null ? (
                  <>
                    <p className="text-lg font-semibold">₹{item.bargainedPrice}</p>
                    <p className="text-sm text-gray-500 line-through">₹{item.price}</p>
                  </>
                ) : (
                  <p className="text-lg font-semibold">₹{item.price}</p>
                )}
                {item.bargainStatus !== "NONE" && (
                  <span className={`text-sm px-2 py-0.5 rounded ${
                    item.bargainStatus === "ACCEPTED" ? "bg-green-100 text-green-800" :
                    item.bargainStatus === "REJECTED" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {item.bargainStatus.charAt(0) + item.bargainStatus.slice(1).toLowerCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-auto">
              <div className="text-sm text-gray-600">
                Quantity: {item.quantity}
              </div>
              <div className="flex gap-2">
                {item.bargainStatus === "NONE" && item.isAvailable && item.stock > 0 && (
                  <IconButton
                    onClick={() => onBargain(item)}
                    icon={<MessageSquare className="h-4 w-4" />}
                    label="Bargain"
                    variant="ghost"
                  />
                )}
                <IconButton
                  onClick={() => onRemove(item.id)}
                  icon={<Trash2 className="h-4 w-4" />}
                  label="Remove"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <ShoppingBag size={96} className="text-gray-400" />
    <h2 className="text-2xl font-semibold">Your cart is empty</h2>
    <p className="text-gray-600 dark:text-gray-400">
      Start shopping to add items to your cart
    </p>
    <Button asChild>
      <Link href="/explore">Start Shopping</Link>
    </Button>
  </div>
);

const CartSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-800 rounded-lg h-[160px] animate-pulse"
          />
        ))}
      </div>
      <div className="lg:w-80">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-[200px] animate-pulse" />
      </div>
    </div>
  </div>
);

interface IconButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  variant?: "ghost" | "default";
  className?: string;
  size?: "sm" | "default";
  label: string;
}

const IconButton = ({ onClick, icon, variant = "default", className = "", size = "default", label }: IconButtonProps) => (
  <Button
    onClick={onClick}
    variant={variant}
    size={size}
    className={className}
    aria-label={label}
  >
    {icon}
  </Button>
);
