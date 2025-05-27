"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lens } from "@/components/ui/lens";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  Share2,
  User,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useItem } from "@/hooks/useItem";
import { useItems } from "@/hooks/useItems";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { use } from "react";

interface ItemDetails {
  _id: string;
  name: string;
  description: string;
  price: number;
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    email: string;
    overallRating: number;
  };
  categories: string[];
  images: string[];
  specifications: {
    [key: string]: string;
  };
  quantity: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { getItem, checkItemInCart, isOwnItem } = useItem();
  const { addToCart: addItemToCart } = useCart();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteItem } = useItems();
  const router = useRouter();
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInCart, setIsInCart] = useState(false);
  const [imageHovering, setImageHovering] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true);
      const itemData = await getItem(resolvedParams.id);
      if (itemData) {
        setItem(itemData);
        // Check if item is in cart
        const inCart = await checkItemInCart(itemData._id);
        setIsInCart(inCart);
      }
      setIsLoading(false);
    };

    fetchItem();
  }, [resolvedParams.id]);

  const addToCart = async () => {
    if (!item) return;
    const result = await addItemToCart(item._id, 1);
    if (result) {
      setIsInCart(true);
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart successfully.",
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    if (!item) return;
    const success = await deleteItem(item._id);
    if (success) {
      toast({
        title: "Item deleted",
        description: "Your item has been deleted successfully.",
      });
      router.push("/seller/dashboard");
    } else {
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
    setIsDeleting(false);
  };

  if (isLoading) {
    return <ItemSkeleton />;
  }

  if (!item) {
    return <div>Item not found</div>;
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
                  window.open(
                    process.env.NEXT_PUBLIC_UPLOADS_URL +
                      "/items/" +
                      item.images[currentImageIndex],
                    "_blank"
                  );
                }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                <Lens hovering={imageHovering} setHovering={setImageHovering}>
                  <Image
                    src={
                      process.env.NEXT_PUBLIC_UPLOADS_URL +
                      "/items/" +
                      item.images[currentImageIndex]
                    }
                    alt={item.name}
                    fill
                    className="object-contain rounded-lg cursor-pointer"
                    priority
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
                <ChevronLeft size={24} />
              </button>

              <div className="flex gap-3">
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

              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === item.images.length - 1 ? 0 : prev + 1
                  )
                }
                className="p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          {/* Thumbnail Preview */}
          <div className="flex gap-2 overflow-x-auto pb-5 scrollbar-thin scrollbar-thumb-gray-100 dark:scrollbar-thumb-gray-700 p-2">
            {item.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                  currentImageIndex === index
                    ? "ring-2 ring-black dark:ring-white"
                    : "ring-1 ring-gray-200 dark:ring-gray-800"
                }`}
              >
                <Image
                  src={
                    process.env.NEXT_PUBLIC_UPLOADS_URL +
                    "/items/" +
                    item.images[index]
                  }
                  alt={`${item.name} preview ${index + 1}`}
                  fill
                  className="object-cover"
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
              <span className="text-2xl font-bold">
                ₹{item.price.toLocaleString()}
              </span>
            </div>
          </div>

          <Card
            onClick={() => {
              router.push("/profile/" + item.seller._id);
            }}
            className="cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-lg">Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={
                        process.env.NEXT_PUBLIC_UPLOADS_URL +
                        "/users/" +
                        item.seller.avatar
                      }
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="flex w-full justify-between flex-col sm:flex-row">
                  <div>
                    <p className="font-medium">
                      {item.seller.firstName + " " + item.seller.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{item.seller.email}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < item.seller.overallRating
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{item.description}</p>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-4 flex-wrap">
            {isOwnItem(item.seller.email) ? (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="lg"
                      variant="destructive"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this item? It will be marked as sold out. This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button size="lg" variant="outline" className="flex-1" disabled>
                  Cannot buy your own item
                </Button>
              </>
            ) : isInCart ? (
              <Button size="lg" variant="outline" className="flex-1" asChild>
                <Link href="/cart">
                  Go to Cart
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="flex-1" onClick={addToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="w-12 flex items-center justify-center"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Link copied",
                  description: "Item link has been copied to clipboard.",
                });
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Sticky Buttons */}
          <div className="fixed w-full bottom-0 left-0 right-0 md:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 p-4 flex gap-4">
            <Button
              size="lg"
              variant="outline"
              className="w-10 flex items-center justify-center"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Link copied",
                  description: "Item link has been copied to clipboard.",
                });
              }}
            >
              <Share2 className="h-4 w-[1/4]" />
            </Button>
            {isOwnItem(item.seller.email) ? (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="lg"
                      variant="destructive"
                      disabled={isDeleting}
                      className="w-[1/4]"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this item? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 w-[2/4] px-0"
                  disabled
                >
                  Can&apos;t buy own item
                </Button>
              </>
            ) : isInCart ? (
              <Button
                size="lg"
                variant="outline"
                className="flex-1 w-[2/4] px-0"
                asChild
              >
                <Link href="/cart">
                  Go to Cart
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="flex-1 w-[2/4] px-0"
                onClick={addToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ItemSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
        <div className="space-y-6">
          <div>
            <div className="h-8 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded-lg w-1/4 mt-2 animate-pulse" />
          </div>
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
};
