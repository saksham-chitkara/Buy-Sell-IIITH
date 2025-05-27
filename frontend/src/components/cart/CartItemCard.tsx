"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Trash2,
  MessageSquare,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { CartItem } from "@/types/cart";

interface CartItemCardProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onBargain: (item: CartItem) => void;
}

export const CartItemCard = ({ item, onRemove, onBargain }: CartItemCardProps) => {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Item Image */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <CloudinaryImage
              publicId={item.image}
              alt={item.name}
              width={96}
              height={96}
              className="object-cover h-full w-full"
              optimization="thumbnail"
            />
          </div>

          {/* Item Details */}
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <button
                onClick={() => onRemove(item.id)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <p
              className="text-sm text-gray-500 cursor-pointer"
              onClick={() => {
                router.push(`/profile/${item.seller.id}`);
              }}
            >
              Sold by: {item.seller.name}
            </p>

            {/* Price Section */}
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {item.bargainedPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{item.price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-lg font-bold">
                    ₹{(item.bargainedPrice ?? item.price).toLocaleString()}
                  </span>
                </div>
                {/* Bargain Status */}
                {item.bargainStatus !== "NONE" && (
                  <div className="flex items-center gap-2 mt-1">
                    {item.bargainStatus === "PENDING" && (
                      <span className="text-sm text-yellow-600 flex items-center gap-1">
                        <Loader2 size={14} className="animate-spin" />
                        Bargain pending
                      </span>
                    )}
                    {item.bargainStatus === "ACCEPTED" && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <Check size={14} />
                        Offer accepted
                      </span>
                    )}
                    {item.bargainStatus === "REJECTED" && (
                      <span className="text-sm text-red-600 flex items-center gap-1">
                        <X size={14} />
                        Offer rejected
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bargain Button */}
              {(item.bargainStatus === "NONE" ||
                item.bargainStatus === "REJECTED") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBargain(item)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare size={16} />
                  Bargain
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};