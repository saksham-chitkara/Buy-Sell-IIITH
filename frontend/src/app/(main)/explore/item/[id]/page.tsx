"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
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
        await removeFromCart(item._id);
        toast.success("Success", { description: "Item removed from cart" });
      } else {
        await addToCart(item._id, 1);
        toast.success("Success", { description: "Item added to cart" });
        setIsShaking(true);
      }
    } catch (error) {
      console.error("Error handling cart action:", error);
      toast.error("Failed to update cart");
    }
  }, [item, isInCart, addToCart, removeFromCart, setIsShaking]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold text-black dark:text-white">
          Item not found
        </h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="relative w-full h-[500px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900">
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

          {/* Navigation Controls */}
          {item.images.length > 1 && (
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? item.images.length - 1 : prev - 1
                  )
                }
                className="p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === item.images.length - 1 ? 0 : prev + 1
                  )
                }
                className="p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Preview Images */}
          {item.images.length > 1 && (
            <div className="flex overflow-x-auto gap-4 pb-4 mt-4">
              {item.images.map((image, index) => (
                <button
                  key={image.public_id || index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                    currentImageIndex === index
                      ? "ring-2 ring-black dark:ring-white"
                      : "ring-1 ring-gray-200 dark:ring-gray-800"
                  }`}
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
          )}

          {/* Dots for mobile */}
          {item.images.length > 1 && (
            <div className="flex justify-center gap-2 lg:hidden">
              {item.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    currentImageIndex === index
                      ? "bg-black dark:bg-white"
                      : "bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                {item.name}
              </h1>
              <p className="text-xl font-bold mt-2 text-black dark:text-white">
                ₹{item.price.toLocaleString()}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Description
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Categories
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.categories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-800"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Seller Info */}
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Seller
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  {item.seller.avatar && item.seller.avatar.url ? (
                    <Image 
                      src={item.seller.avatar.url} 
                      alt="User avatar"
                      fill
                      className="object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
                        {item.seller.firstName[0]}
                        {item.seller.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-black dark:text-white">
                    {item.seller.firstName} {item.seller.lastName}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Rating: {item.seller.overallRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Button */}
            {item.quantity > 0 && item.isAvailable && user && user.id !== item.seller._id && (
              <Button
                onClick={handleCartAction}
                className="w-full"
                size="lg"
              >
                {isInCart ? "Remove from Cart" : "Add to Cart"}
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
    </div>
  );
}
