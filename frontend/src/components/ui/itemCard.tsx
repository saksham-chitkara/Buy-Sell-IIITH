"use client";

import Image from "next/image";
import React, { ReactNode } from "react";
import { CardBody, CardContainer, CardItem } from "./3d-card";
import { useRouter } from "next/navigation";

interface CloudinaryImage {
  public_id: string;
  url: string;
}

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: CloudinaryImage[];
  categories: string[];
  seller: {
    firstName: string;
    lastName: string;
  };
}

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/explore/item/${item._id}`)}
      className="cursor-pointer"
    >
      <CardContainer className="w-full">
        <CardBody className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 relative group/card w-full rounded-xl p-6">
          <CardItem
            translateZ="50"
            className="text-xl font-bold text-black dark:text-white line-clamp-1"
          >
            {item.name}
          </CardItem>

          <CardItem
            translateZ="60"
            className="text-gray-600 dark:text-gray-300 text-sm md:text-base mt-2 line-clamp-2"
          >
            {item.description}
          </CardItem>

          <CardItem translateZ="100" className="flex-1 w-full mt-4">
            <div className="relative w-full h-60">
              <Image
                src={item.images?.[0]?.url || "/default-item.jpg"}
                fill
                className="object-cover rounded-xl group-hover/card:shadow-xl"
                alt={item.name || "Item image"}
              />
            </div>
          </CardItem>

          <div className="flex justify-between items-center mt-6">
            <CardItem
              translateZ={20}
              className="text-lg font-bold text-black dark:text-white"
            >
              ₹{item.price?.toLocaleString() || "0"}
            </CardItem>

            <CardItem
              translateZ={20}
              className="text-sm text-gray-500 dark:text-gray-400 text-right"
            >
              by {item.seller?.firstName || "Unknown"}{" "}
              {item.seller?.lastName || ""}
            </CardItem>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {(item.categories || []).map((category) => (
              <CardItem
                key={category}
                translateZ={20}
                className="w-fit px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
              >
                {category}
              </CardItem>
            ))}
          </div>
        </CardBody>
      </CardContainer>
    </div>
  );
}
