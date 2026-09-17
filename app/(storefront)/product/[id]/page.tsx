"use client";

import { useParams, useRouter } from "next/navigation";
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { products, loading } = useProducts();
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState("48");
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"delivery" | "care" | "provenance">("delivery");

  const product = products.find((p) => p.id === id);

  if (loading) {
    return (
      <div className="max-w-[1720px] mx-auto px-8 py-24 min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 rounded-full border border-black/20 mx-auto" />
          <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400 block">
            Loading Creation Details...
          </span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1720px] mx-auto px-8 py-32 text-center">
        <h2 className="font-serif text-3xl tracking-widest uppercase mb-4">
          Creation Not Found
        </h2>
        <p className="text-[12px] uppercase tracking-wider text-neutral-500 mb-8">
          This piece may have been de-listed or archived by the atelier.
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white text-[11px] tracking-[0.25em] uppercase py-3.5 px-8"
        >
          Return to Atelier
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(product.price);

  const SIZES = product.category === "Men" ? ["46", "48", "50", "52", "54"] : ["36", "38", "40", "42", "44"];

  return (
    <div className="max-w-[1720px] mx-auto px-8 py-12">
      {/* Breadcrumb row */}
      <div className="flex items-center justify-between border-b border-black/[0.08] pb-6 mb-12">
        <div className="flex items-center space-x-2 text-[10px] tracking-[0.25em] uppercase text-neutral-400">
          <Link href="/" className="hover:text-black">
            Atelier
          </Link>
          <span>/</span>
          <Link href={product.category === "Men" ? "/men" : "/women"} className="hover:text-black">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-black font-semibold truncate max-w-xs">{product.title}</span>
        </div>

        <button
          onClick={() => router.back()}
          className="flex items-center space-x-1.5 text-[10px] tracking-[0.2em] uppercase text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>
      </div>

      {/* Asymmetrical 2-Column Luxury Layout */}
      <div className="grid grid-cols-12 gap-16 items-start">
        {/* Left Column: High-Res Editorial Gallery (7 cols) */}
        <div className="col-span-7 space-y-8">
          {/* Main Hero Shot */}
          <div className="bg-[#edeae4] overflow-hidden aspect-[3/4] shadow-sm">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Secondary Lookbook Shot if available */}
          {product.secondary_image_url && (
            <div className="bg-[#edeae4] overflow-hidden aspect-[3/4] shadow-sm">
              <img
                src={product.secondary_image_url}
                alt={`${product.title} silhouette`}
                className="w-full h-full object-cover object-center"
              />
            </div>
          )}
        </div>

        {/* Right Column: Sticky Purchasing Details (5 cols) */}
        <div className="col-span-5 sticky top-28 space-y-8 pl-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-black text-white text-[9px] tracking-[0.25em] uppercase font-semibold px-2.5 py-1">
                {product.category}'s Haute Couture
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-mono">
                REF: {product.id.slice(0, 10).toUpperCase()}
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl tracking-[0.08em] uppercase font-normal text-neutral-900 mt-3 leading-tight">
              {product.title}
            </h1>

            <div className="text-xl font-sans tracking-wide text-neutral-900 mt-4 font-light">
              {formattedPrice}
            </div>
          </div>

          {/* Editorial Description */}
          <div className="border-t border-b border-black/[0.08] py-6">
            <p className="text-[13px] text-neutral-700 leading-relaxed font-light tracking-wide">
              {product.description}
            </p>

            {product.details && (
              <div className="mt-4 pt-4 border-t border-black/[0.05] flex items-center space-x-2 text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                <Sparkles size={13} className="text-neutral-700 shrink-0" />
                <span>{product.details}</span>
              </div>
            )}
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-3 text-[11px] uppercase tracking-[0.2em]">
              <span className="font-semibold text-neutral-800">Select French Size</span>
              <span className="text-neutral-400 text-[10px] underline cursor-pointer">
                Size Guide
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 text-[12px] uppercase font-medium tracking-wider border transition-all ${
                    selectedSize === size
                      ? "bg-black text-white border-black"
                      : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Shopping Bag Action */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAdd}
              className="w-full bg-[#09090b] hover:bg-black text-white text-[11px] tracking-[0.25em] uppercase font-semibold py-4 px-6 flex items-center justify-center space-x-2 transition-colors shadow-lg"
            >
              {added ? (
                <>
                  <Check size={16} />
                  <span>Added To Shopping Bag</span>
                </>
              ) : (
                <span>Add To Shopping Bag • {formattedPrice}</span>
              )}
            </button>

            <p className="text-[10px] tracking-[0.1em] text-neutral-400 text-center font-light uppercase">
              Taxes and insured courier calculated at checkout
            </p>
          </div>

          {/* Atelier Guarantees Accordion */}
          <div className="border-t border-black/[0.08] pt-6 space-y-4">
            <div className="flex border-b border-black/[0.08] text-[10px] uppercase tracking-[0.2em]">
              <button
                onClick={() => setActiveTab("delivery")}
                className={`pb-2.5 mr-6 transition-colors ${
                  activeTab === "delivery" ? "border-b-2 border-black font-semibold text-black" : "text-neutral-400"
                }`}
              >
                Courier Delivery
              </button>
              <button
                onClick={() => setActiveTab("care")}
                className={`pb-2.5 mr-6 transition-colors ${
                  activeTab === "care" ? "border-b-2 border-black font-semibold text-black" : "text-neutral-400"
                }`}
              >
                Atelier Care
              </button>
              <button
                onClick={() => setActiveTab("provenance")}
                className={`pb-2.5 transition-colors ${
                  activeTab === "provenance" ? "border-b-2 border-black font-semibold text-black" : "text-neutral-400"
                }`}
              >
                Authenticity
              </button>
            </div>

            <div className="text-[12px] text-neutral-600 font-light leading-relaxed min-h-[60px]">
              {activeTab === "delivery" && (
                <div className="flex items-start space-x-3">
                  <Truck size={16} className="text-neutral-800 shrink-0 mt-0.5" />
                  <span>
                    Complimentary DHL Express courier within 2–4 business days. Signature required upon receipt in our custom black presentation box.
                  </span>
                </div>
              )}
              {activeTab === "care" && (
                <div className="flex items-start space-x-3">
                  <RotateCcw size={16} className="text-neutral-800 shrink-0 mt-0.5" />
                  <span>
                    Specialist dry clean only. Store on provided cedarwood contoured hanger with breathable garment protector.
                  </span>
                </div>
              )}
              {activeTab === "provenance" && (
                <div className="flex items-start space-x-3">
                  <ShieldCheck size={16} className="text-neutral-800 shrink-0 mt-0.5" />
                  <span>
                    Each creation includes an NFC-enabled authenticity medallion registered to the Mozart digital archive in Paris.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
