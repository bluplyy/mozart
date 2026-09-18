"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div
      className="group relative flex flex-col cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`} className="block overflow-hidden bg-[#f0eee9] relative aspect-[3/4]">
        {/* Main image */}
        {(() => {
          const primaryImg = product.images?.[0] || product.image_url;
          const secondaryImg = product.images?.[1] || product.secondary_image_url;
          return (
            <>
              <img
                src={primaryImg}
                alt={product.title}
                className={`w-full h-full object-cover object-center transform transition-all duration-700 ease-out ${
                  secondaryImg && isHovered
                    ? "opacity-0 scale-105"
                    : "opacity-100 scale-100 group-hover:scale-105"
                }`}
                loading="lazy"
              />

              {/* Secondary image on hover if available */}
              {secondaryImg && (
                <img
                  src={secondaryImg}
                  alt={`${product.title} detail view`}
                  className={`absolute inset-0 w-full h-full object-cover object-center transform transition-all duration-700 ease-out ${
                    isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                  loading="lazy"
                />
              )}
            </>
          );
        })()}

        {/* Category Pill Tag */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-[#09090b] text-[9px] tracking-[0.25em] uppercase font-semibold px-2.5 py-1">
            {product.category}
          </span>
        </div>
      </Link>

      {/* Product metadata */}
      <div className="pt-4 flex flex-col">
        <div className="flex items-baseline justify-between">
          <Link href={`/product/${product.id}`}>
            <h3 className="text-[13px] tracking-[0.14em] uppercase text-neutral-900 font-medium group-hover:text-neutral-600 transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <span className="text-[13px] font-sans font-light tracking-[0.05em] text-neutral-800 ml-2 shrink-0">
            {formattedPrice}
          </span>
        </div>

        {product.details && (
          <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1 font-light tracking-wide">
            {product.details}
          </p>
        )}
      </div>
    </div>
  );
}
