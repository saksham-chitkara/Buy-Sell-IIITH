"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Loader2,
  ShoppingBag,
  RefreshCcw,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { useRouter } from "next/navigation";
import { ReCAPTCHA } from "@/components/recaptcha";
import { CartItem } from "@/types/cart";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { CartSkeleton } from "@/components/cart/CartSkeleton";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [showBargainDialog, setShowBargainDialog] = useState(false);
  const [bargainPrice, setBargainPrice] = useState("");
  const [bargainMessage, setBargainMessage] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    getCart,
    bargainItem,
    isLoading,
    removeFromCart: cartHooksRemoveFromCart,
  } = useCart();
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

  const submitBargain = async () => {
    if (!selectedItem || !bargainPrice || !bargainMessage) return;

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
      parseFloat(bargainPrice),
      bargainMessage
    );

    if (!success) {
      // Revert optimistic update on failure
      const cartItems = await getCart();
      if (cartItems) {
        setCartItems(cartItems);
      }
    }
  };

  const placeOrder = async () => {
    if (!recaptchaToken) {
      toast({
        title: "Verification required",
        description: "Please wait for reCAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    setIsOrdering(true);
    try {
      const result = await createOrder(
        cartItems.map((item) => item.id),
        recaptchaToken
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

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error loading cart</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <CartItemCard
                    item={item}
                    onRemove={removeFromCart}
                    onBargain={inititateBargain}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex justify-between items-center">
                    <span>Order Summary</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const fetchCart = async () => {
                          const cartItems = await getCart();
                          if (cartItems) {
                            setCartItems(cartItems);
                          }
                        };
                        fetchCart();
                      }}
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{getTotalCost().toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{getTotalCost().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={placeOrder}
                  disabled={isOrdering}
                >
                  {isOrdering ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingBag className="mr-2 h-4 w-4" />
                  )}
                  Place Order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* Bargain Dialog */}
      <Dialog open={showBargainDialog} onOpenChange={setShowBargainDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
            <DialogDescription>
              Propose your price and add a message for the seller.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Your Offer</label>
              <Input
                type="number"
                value={bargainPrice}
                onChange={(e) => setBargainPrice(e.target.value)}
                placeholder="Enter your price"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message to Seller</label>
              <textarea
                value={bargainMessage}
                onChange={(e) => setBargainMessage(e.target.value)}
                placeholder="Explain why you're requesting this price"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBargainDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={submitBargain}>Send Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ReCAPTCHA onVerify={setRecaptchaToken} />
    </div>
  );
}


