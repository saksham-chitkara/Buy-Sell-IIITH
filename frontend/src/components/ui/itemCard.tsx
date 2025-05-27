"use client";

import Image from "next/image";
import React, { ReactNode } from "react";
import { CardBody, CardContainer, CardItem } from "./3d-card";
import { useRouter } from "next/navigation";

interface ItemCardProps {
  itemID?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  price?: number;
  actionButton?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function ItemCard({
  itemID = "0",
  title = "Title",
  description = "Description",
  imageUrl = "/images/test.png",
  imageAlt = "thumbnail",
  price,
  actionButton,
  children,
  className,
}: ItemCardProps) {
  const router = useRouter();

  return (
    <div className="w-full px-4">
      <CardContainer className="inter-var w-full">
        <CardBody
          className={`relative group/card bg-white dark:bg-gray-900 rounded-2xl shadow-lg 
            hover:shadow-xl transition-shadow duration-300 border border-gray-200 
            dark:border-gray-800 aspect-square w-full max-w-2xl mx-auto ${className}`}
        >
          <div className="absolute inset-0 p-6 flex flex-col">
            <CardItem
              translateZ="50"
              className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white"
            >
              {title}
            </CardItem>

            <CardItem
              as="p"
              translateZ="60"
              className="text-gray-600 dark:text-gray-300 text-sm md:text-base mt-2 line-clamp-2"
            >
              {description}
            </CardItem>

            {imageUrl && (
              <CardItem translateZ="100" className="flex-1 w-full mt-4">
                <div
                  className="relative w-full h-full group/image"
                  onClick={() => router.push(`/explore/item/${itemID}`)}
                >
                  <Image
                    src={imageUrl}
                    fill
                    className="object-cover rounded-xl group-hover/card:shadow-xl"
                    alt={imageAlt}
                  />
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 
                    group-hover/image:opacity-100 transition-opacity duration-300 
                    flex items-center justify-center rounded-xl cursor-pointer"
                  >
                    <span className="text-white font-semibold text-lg">
                      Click to view details
                    </span>
                  </div>
                </div>
              </CardItem>
            )}

            {children}

            <div className="flex justify-between items-center mt-4">
              {price && (
                <CardItem
                  translateZ={20}
                  className="text-sm md:text-base font-semibold dark:text-white"
                >
                  ₹{price.toLocaleString()}
                </CardItem>
              )}

              {actionButton && (
                <CardItem
                  translateZ={20}
                  className="transform transition-transform duration-300 hover:scale-105"
                >
                  {actionButton}
                </CardItem>
              )}
            </div>
          </div>
        </CardBody>
      </CardContainer>
    </div>
  );
}
