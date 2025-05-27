"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export const EmptyCart = () => {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
        <ShoppingBag size={96} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">
        Looks like you haven&apos;t added any items to your cart yet.
      </p>
      <Button asChild>
        <Link href="/explore">Start Shopping</Link>
      </Button>
    </div>
  );
};