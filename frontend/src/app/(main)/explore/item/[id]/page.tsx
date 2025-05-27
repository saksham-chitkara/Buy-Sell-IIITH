"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Lens } from "@/components/ui/lens";
import { handleImageError } from "@/utils/resource-helpers";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronLeftCircle,
  ChevronRightCircle,
  ArrowLeft,
  User,
  Star,
} from "lucide-react";
// Fix import paths 
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
// Define local shake hook to avoid TypeScript errors
const useShake = () => {
  const [isShaking, setIsShaking] = useState(false);
  
  const shake = () => {
    if (!isShaking) {
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
    }
  };

  return {
    isShaking,
    shake,
    setIsShaking,
    className: isShaking ? 'animate-shake' : '',
  };
};

// Define getCurrentUser hook to avoid TypeScript errors
const useCurrentUser = () => {
  const auth = useAuth();
  return { 
    user: auth.user, 
    isLoading: auth.isLoading, 
    isAuthenticated: auth.isAuthenticated 
  };
};

interface CloudinaryImage {
  public_id: string;
  url: string;
}

interface Seller {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  overallRating: number;
  avatar?: CloudinaryImage;
}

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: CloudinaryImage[];
  categories: string[];
  seller: Seller;
  isAvailable: boolean;
}

export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise using React.use()
  const { id: itemId } = React.use(params);
  
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [imageHovering, setImageHovering] = useState(false);

  const router = useRouter();
  const { user } = useCurrentUser();
  const { addToCart, removeFromCart, items: cartItems } = useCart();
  const { shake, setIsShaking } = useShake();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true);
        // Use the getApiUrl utility for consistent API URL handling
        const { getApiUrl } = await import("@/utils/resource-helpers");
        const res = await fetch(getApiUrl(`items/${itemId}`));
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        setItem(data);
      } catch (error) {
        console.error("Error fetching item:", error);
        toast.error("Failed to fetch item details");
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  useEffect(() => {
    if (item && cartItems) {
      setIsInCart(cartItems.some((cartItem) => cartItem.itemId === item._id));
    }
  }, [item, cartItems]);

  const handleCartAction = useCallback(async () => {
    if (!item) return;

    try {
      if (isInCart) {
        router.push("/cart");
      } else {
        await addToCart(item._id, 1);
        toast.success("Success", { description: "Item added to cart" });
        setIsShaking(true);
      }
    } catch (error) {
      console.error("Error handling cart action:", error);
      toast.error("Failed to update cart");
    }
  }, [item, isInCart, addToCart, router, setIsShaking]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white mx-auto" /></div>;
  }

  if (!item) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-4xl font-bold text-center">Item not found</h1><Button onClick={() => router.back()} className="mx-auto mt-4">Go Back</Button></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery with Lens */}
        <div className="space-y-4">
          {/* Hover Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: imageHovering ? 0 : 0.7 }}
            className="text-center bg-black/50 text-white px-4 py-2 rounded-full text-sm pointer-events-none w-fit mx-auto"
          >
            Hover to zoom
          </motion.div>

          {/* Main Image Container */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                onClick={() => {
                  if (item.images[currentImageIndex]?.url) {
                    window.open(item.images[currentImageIndex]?.url, "_blank");
                  }
                }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                <Lens hovering={imageHovering} setHovering={setImageHovering}>
                  <Image
                    src={item.images[currentImageIndex]?.url || "/default-item.jpg"}
                    alt={item.name}
                    fill
                    className="object-contain rounded-lg cursor-pointer"
                    priority
                    onError={handleImageError}
                  />
                </Lens>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls & Thumbnails */}
          {item.images.length > 1 && (
            <div className="flex items-center justify-center gap-6 mt-2">
              <button
                onClick={() => setCurrentImageIndex((prev) => prev === 0 ? item.images.length - 1 : prev - 1)}
                className="p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <div className="flex gap-3">
                {item.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${currentImageIndex === index ? "bg-black dark:bg-white" : "bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentImageIndex((prev) => prev === item.images.length - 1 ? 0 : prev + 1)}
                className="p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Thumbnail Preview */}
          <div className="flex gap-2 overflow-x-auto pb-5 scrollbar-thin scrollbar-thumb-gray-100 dark:scrollbar-thumb-gray-700 p-2">
            {item.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${currentImageIndex === index ? "ring-2 ring-black dark:ring-white" : "ring-1 ring-gray-200 dark:ring-gray-800"}`}
              >
                <Image
                  src={image.url || "/default-item.jpg"}
                  alt={`${item.name} preview ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{item.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-bold">₹{item.price.toLocaleString()}</span>
            </div>
          </div>

          <Card onClick={() => router.push("/profile/" + item.seller._id)} className="cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                  {item.seller.avatar && item.seller.avatar.url ? (
                    <Image
                      src={item.seller.avatar.url}
                      alt="User avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="flex w-full justify-between flex-col sm:flex-row">
                  <div>
                    <p className="font-medium">{item.seller.firstName + " " + item.seller.lastName}</p>
                    <p className="text-sm text-gray-500">{item.seller.email}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4" />
                    <span className="font-semibold">{item.seller.overallRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{item.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Categories</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {item.categories.map((category) => (
                <span key={category} className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-800">{category}</span>
              ))}
            </div>
          </div>

          {/* Cart Button, Out of Stock, Own Item, Not Logged In */}
          {item.quantity > 0 && item.isAvailable && user && user.id !== item.seller._id && (
            <Button
              onClick={handleCartAction}
              className={isInCart ? "w-full bg-white text-black border-2 border-black hover:bg-gray-50" : "w-full"}
              size="lg"
            >
              {isInCart ? (
                <div className="flex items-center gap-2">
                  Go to Cart
                  <ChevronRightIcon className="w-4 h-4" />
                </div>
              ) : (
                "Add to Cart"
              )}
            </Button>
          )}

          {/* Out of Stock */}
          {(!item.isAvailable || item.quantity === 0) && (
            <Button disabled className="w-full" size="lg">
              Out of Stock
            </Button>
          )}

          {/* Own Item */}
          {user && user.id === item.seller._id && (
            <Button disabled className="w-full" size="lg">
              This is your item
            </Button>
          )}

          {/* Not Logged In */}
          {!user && (
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full"
              size="lg"
            >
              Login to Buy
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
