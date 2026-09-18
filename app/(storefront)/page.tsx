"use client";

import Link from "next/link";
import { useProducts } from "@/context/ProductContext";
import ProductCard from "@/components/storefront/ProductCard";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { products, loading } = useProducts();

  // Featured creations (top 4)
  const featured = products.slice(0, 4);

  return (
    <div className="space-y-32 pb-24">
      {/* 1. CINEMATIC EDITORIAL HERO BANNER */}
      <section className="relative h-[90vh] min-h-[700px] w-full overflow-hidden bg-black">
        {/* Background Editorial Visual */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop"
            alt="Mozart Designer Campaign"
            className="w-full h-full object-cover object-center opacity-70 scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
        </div>

      </section>

      {/* 2. THE TWO UNIVERSES: DUAL SPLIT PORTAL */}
      <section id="split-showcase" className="max-w-[1720px] mx-auto px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block mb-3 font-semibold">
            Two Distinct Universes
          </span>
          <h2 className="font-serif text-4xl tracking-[0.15em] uppercase font-normal text-[#09090b]">
            The Dual Collections
          </h2>
          <div className="w-12 h-[1px] bg-black/20 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Men's Universe */}
          <Link
            href="/men"
            className="group relative h-[680px] overflow-hidden bg-black flex flex-col justify-end p-12 text-white"
          >
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1400&auto=format&fit=crop"
              alt="Mozart Men"
              className="absolute inset-0 w-full h-full object-cover object-top opacity-80 group-hover:scale-105 group-hover:opacity-65 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block mb-2">
                Fine Timepieces & Attire
              </span>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-4xl tracking-[0.15em] uppercase font-normal">
                  Men's Collection
                </h3>
                <span className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <p className="text-[12px] text-neutral-300 font-light mt-3 max-w-sm tracking-wide">
                Rigorous outerwear, tailored box calfskin boots, and evening silk shirting.
              </p>
            </div>
          </Link>

          {/* Women's Universe */}
          <Link
            href="/women"
            className="group relative h-[680px] overflow-hidden bg-black flex flex-col justify-end p-12 text-white"
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop"
              alt="Mozart Women"
              className="absolute inset-0 w-full h-full object-cover object-top opacity-80 group-hover:scale-105 group-hover:opacity-65 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block mb-2">
                Runway, Leather & Studio
              </span>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-4xl tracking-[0.15em] uppercase font-normal">
                  Women's Collection
                </h3>
                <span className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <p className="text-[12px] text-neutral-300 font-light mt-3 max-w-sm tracking-wide">
                Architectural bias-cut column gowns, sculpted blazers, and handcrafted monogram sacs.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. CURATED SEASONAL HIGHLIGHTS */}
      <section className="max-w-[1720px] mx-auto px-8">
        <div className="flex items-end justify-between mb-12 border-b border-black/[0.08] pb-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-semibold block mb-2">
              Curated Selection
            </span>
            <h2 className="font-serif text-3xl tracking-[0.15em] uppercase font-normal text-[#09090b]">
              Studio Highlights
            </h2>
          </div>
          <div className="flex items-center space-x-8 text-[11px] uppercase tracking-[0.2em]">
            <Link href="/men" className="text-neutral-500 hover:text-black transition-colors">
              View All Men ({products.filter((p) => p.category === "Men").length})
            </Link>
            <span className="text-neutral-300">/</span>
            <Link href="/women" className="text-neutral-500 hover:text-black transition-colors">
              View All Women ({products.filter((p) => p.category === "Women").length})
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="bg-neutral-200 aspect-[3/4] w-full" />
                <div className="h-4 bg-neutral-200 w-3/4" />
                <div className="h-3 bg-neutral-200 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. THE STUDIO MANIFESTO */}
      <section id="atelier" className="bg-[#09090b] text-[#fafaf8] py-28">
        <div className="max-w-[1300px] mx-auto px-8 text-center">
          <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-400 font-semibold block mb-8">
            High Fashion Manifesto
          </span>
          <blockquote className="font-serif text-3xl md:text-5xl lg:text-5xl tracking-[0.08em] uppercase font-normal leading-[1.3] max-w-4xl mx-auto mb-12">
            "A garment is not merely attire. It is personal architecture—a geometry of presence constructed to defy ephemerality."
          </blockquote>
          <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 block">
            — Mozart Design Studio, Paris
          </span>
        </div>
      </section>
    </div>
  );
}
