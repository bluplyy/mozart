"use client";

import { useProducts } from "@/context/ProductContext";
import ProductCard from "@/components/storefront/ProductCard";
import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

export default function WomenCollectionPage() {
  const { products, loading } = useProducts();
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  const womenProducts = products.filter((p) => p.category === "Women");

  const sortedProducts = [...womenProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="max-w-[1720px] mx-auto px-8 py-16">
      {/* Editorial Category Header */}
      <div className="border-b border-black/[0.08] pb-10 mb-12">
        <div className="flex items-center space-x-2 text-[10px] tracking-[0.25em] uppercase text-neutral-400 mb-3">
          <Link href="/" className="hover:text-black">
            Atelier
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">Women</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-serif text-5xl tracking-[0.1em] uppercase font-normal text-neutral-900">
              Women's Collection
            </h1>
            <p className="text-neutral-500 text-[13px] font-light tracking-wide mt-2">
              Runway column gowns, hourglass tailored wool blazers, and handcrafted monogram leatherware.
            </p>
          </div>

          <div className="flex items-center space-x-6 text-[11px] uppercase tracking-[0.2em]">
            <span className="text-neutral-400">
              {womenProducts.length} {womenProducts.length === 1 ? "Creation" : "Creations"}
            </span>

            <div className="flex items-center space-x-2 border-l border-neutral-300 pl-6">
              <SlidersHorizontal size={13} className="text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-[11px] uppercase tracking-[0.15em] outline-none cursor-pointer text-neutral-800 font-medium"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="bg-neutral-200 aspect-[3/4] w-full" />
              <div className="h-4 bg-neutral-200 w-3/4" />
              <div className="h-3 bg-neutral-200 w-1/4" />
            </div>
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="py-24 text-center">
          <span className="font-serif text-3xl uppercase tracking-widest text-neutral-400 block mb-3">
            No Women's Pieces Active
          </span>
          <p className="text-[12px] uppercase tracking-wider text-neutral-500 mb-6">
            New seasonal pieces can be published via the Studio / Admin portal.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-black text-white text-[11px] tracking-[0.25em] uppercase py-3.5 px-8"
          >
            Open Admin Studio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-x-8 gap-y-16">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
