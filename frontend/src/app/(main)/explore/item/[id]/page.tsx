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
  ShareIcon,
} from "lucide-react";
import Link from 'next/link';
import { DEFAULT_AVATAR_URL, getItemImageUrl } from '@/utils/image-helpers';
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
        toast.error("Failed to fetch item details", {
          style: { background: '#dc2626', color: 'white' },
          duration: 2000,
        });
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

    try {      if (isInCart) {
        router.push("/cart");
      } else {
        await addToCart(item._id, 1);
        toast.success("Item added to cart", {
          style: { background: '#22c55e', color: 'white' },
          duration: 2000,
        });
        setIsShaking(true);
      }
    } catch (error) {
      console.error("Error handling cart action:", error);
      toast.error("Failed to update cart", {
        style: { background: '#dc2626', color: 'white' },
        duration: 2000,
      });
    }
  }, [item, isInCart, addToCart, router, setIsShaking]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white mx-auto" /></div>;
  }

  if (!item) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-4xl font-bold text-center">Item not found</h1><Button onClick={() => router.back()} className="mx-auto mt-4">Go Back</Button></div>;
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Image Gallery with Lens */}
        <div className="space-y-4 max-w-md mx-auto w-full">          {/* Main Image Container */}          <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 border-2 border-black dark:border-gray-700">
            {/* Navigation Arrows - Always visible */}
            <button
              onClick={() => setCurrentImageIndex((prev) => prev === 0 ? item.images.length - 1 : prev - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white dark:bg-white/80 dark:hover:bg-white/90 transition-colors"
              disabled={item.images.length <= 1}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentImageIndex((prev) => prev === item.images.length - 1 ? 0 : prev + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white dark:bg-white/80 dark:hover:bg-white/90 transition-colors"
              disabled={item.images.length <= 1}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
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
                    className="object-cover"
                    priority
                    onError={handleImageError}
                  />
                </Lens>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnail Gallery */}
          {item.images.length > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto py-2">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all ${
                    currentImageIndex === index
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={typeof image === 'string' ? image : image.url}
                    alt={`Product thumbnail ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          {/* Name */}
          <h1 className="text-2xl font-bold tracking-tight">{item.name}</h1>
          
          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">₹{item.price}</span>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {item.categories.map((category, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {category}
              </span>
            ))}
          </div>          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Seller Information */}
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">Sold by</p>            <Link href={`/profile/${item.seller._id}`} className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={item.seller.avatar ? getItemImageUrl(item.seller.avatar) : DEFAULT_AVATAR_URL}
                  alt={`${item.seller.firstName} ${item.seller.lastName}'s profile`}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {item.seller.firstName} {item.seller.lastName}
                </h3>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.seller.overallRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Share Button */}
          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({
                  title: item.name,
                  text: item.description,
                  url: url,
                })
                .catch(() => {
                  navigator.clipboard.writeText(url);
                  toast.success('Link copied to clipboard!');
                });
              } else {
                navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
              }
            }}            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <ShareIcon className="w-4 h-4" />
            <span>Share</span>
          </button>

          {/* Action Buttons */}
          <div className="pt-2">
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
    </div>
  );
}
