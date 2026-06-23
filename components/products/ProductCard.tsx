"use client";

import { Product } from "./types/product";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Plus } from "lucide-react";
import { highlightText } from "@/lib/highlightText";
import { CldImage } from "next-cloudinary";
import Image from "next/image";
import { isVideoAsset, getPublicId, getVideoUrl } from "@/lib/cloudinary";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  searchQuery?: string;
}

const ProductCard = ({
  product,
  onClick,
  searchQuery = "",
}: ProductCardProps) => {
  const isVideo = isVideoAsset(product.image);
  const publicId = product.image ? getPublicId(product.image) : null;

  return (
    <div className="group sm:hover:cursor-pointer" onClick={onClick}>
      <div className="relative w-full aspect-square rounded-xl overflow-hidden">
        {product.image && publicId ? (
          isVideo ? (
            <video
              src={getVideoUrl(publicId)}
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                !product.in_stock && "grayscale"
              }`}
            />
          ) : (
            <CldImage
              alt={product.title}
              src={publicId}
              className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
                !product.in_stock && "grayscale"
              }`}
              fill
              crop={{ type: "auto", source: true }}
            />
          )
        ) : (
          <Image
            src="/assets/mustard-back.jpg"
            alt="Mockup"
            className={`object-cover object-center transition-transform duration-300 group-hover:scale-110 opacity-50 ${
              !product.in_stock && "grayscale"
            }`}
            fill
          />
        )}

        {!product.in_stock && (
          <Badge className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white text-red-500 font-semibold text-xs sm:text-sm">
            Out of stock
          </Badge>
        )}

        <Button
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 h-11 rounded-full border border-white p-2 transition-transform duration-300 hover:scale-110"
          disabled={!product.in_stock}
        >
          <Plus className="size-4 sm:size-5" />
          <span className="hidden sm:inline ml-1">Add</span>
        </Button>
      </div>

      <div className="flex flex-col gap-1 py-3">
        <h3 className="text-lg sm:text-xl font-semibold">
          {highlightText(product.title, searchQuery)}
        </h3>

        <p className="text-sm sm:text-base text-gray-500 truncate">
          {highlightText(product.description ?? "", searchQuery)}
        </p>

        <span className="text-xl sm:text-3xl font-semibold font-playfair">
          ${Number(product.amount ?? 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default ProductCard;
