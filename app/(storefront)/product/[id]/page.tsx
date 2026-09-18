"use client";

import { useParams, useRouter } from "next/navigation";
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Heart,
} from "lucide-react";

/**
 * Bi-directional sticky hook for luxury PDP right column.
 *
 * Both columns scroll together with natural page scroll.
 * When the right column's content is taller than the available viewport:
 *   - Scrolling DOWN: right column scrolls up until its bottom aligns with
 *     the viewport bottom, then sticks there while the left gallery continues.
 *   - Scrolling UP: right column scrolls down until its top aligns with the
 *     header bottom, then sticks there while the left gallery continues.
 *
 * When right column fits within the viewport, simple top-sticky is used.
 *
 * No scroll-jacking, no fake parallax, no arbitrary multipliers.
 * Uses a single passive scroll listener with no React state updates.
 */
function useBidirectionalSticky(enabled: boolean) {
  const ref = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const currentTopRef = useRef<number | null>(null);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const headerHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--header-height"
        )
      ) || 111;
    const viewportHeight = window.innerHeight;
    const elHeight = el.getBoundingClientRect().height;
    const availableHeight = viewportHeight - headerHeight;

    // If the content fits in the viewport, pin at the top
    if (elHeight <= availableHeight) {
      el.style.top = `${headerHeight}px`;
      currentTopRef.current = headerHeight;
      lastScrollY.current = window.scrollY;
      return;
    }

    // Bi-directional sticky: clamp the top value between two bounds
    const maxTop = headerHeight; // top-aligned (scrolling up)
    const minTop = viewportHeight - elHeight; // bottom-aligned (scrolling down)

    const scrollY = window.scrollY;
    const delta = scrollY - lastScrollY.current;
    lastScrollY.current = scrollY;

    // Initialize currentTop on first scroll
    if (currentTopRef.current === null) {
      currentTopRef.current = maxTop;
    }

    // Adjust top by the scroll delta, clamped within bounds
    let newTop = currentTopRef.current - delta;
    newTop = Math.max(minTop, Math.min(maxTop, newTop));
    currentTopRef.current = newTop;

    el.style.top = `${newTop}px`;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Initial measurement
    lastScrollY.current = window.scrollY;
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled, onScroll]);

  return ref;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { products, loading } = useProducts();
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Noir Obsidian");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop for bi-directional sticky
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const infoRef = useBidirectionalSticky(isDesktop);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

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
          This piece may have been de-listed or archived by the studio.
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white text-[11px] tracking-[0.25em] uppercase py-3.5 px-8"
        >
          Return to Studio
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(product.price);

  const SIZES = ["L", "XL", "M", "S", "XS"];
  const availableSizesList = product.available_sizes || [
    "L",
    "XL",
    "M",
    "S",
    "XS",
  ];

  const currentSize = availableSizesList.includes(selectedSize)
    ? selectedSize
    : availableSizesList[0] || "M";

  const handleAdd = () => {
    addToCart(product, currentSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Curated color variants
  const COLOR_VARIANTS = [
    { name: "Noir Obsidian", hex: "#171717" },
    { name: "Ivoire Crème", hex: "#ebe6dc" },
    { name: "Fauve Camel", hex: "#8c5b36" },
  ];

  // Prepare gallery images (ensuring multiple stacked editorial looks)
  const galleryImages = (() => {
    if (product.images && product.images.length >= 3) {
      return product.images;
    }
    const base = [
      product.image_url,
      ...(product.secondary_image_url
        ? [product.secondary_image_url]
        : []),
    ].filter(Boolean) as string[];

    if (base.length === 1) {
      return [
        base[0],
        `${base[0]}&auto=format&fit=crop&crop=faces,top`,
        `${base[0]}&auto=format&fit=crop&crop=center`,
        `${base[0]}&auto=format&fit=crop&crop=edges`,
      ];
    }
    if (base.length === 2) {
      return [
        base[0],
        base[1],
        `${base[0]}&auto=format&fit=crop&crop=center`,
        `${base[1]}&auto=format&fit=crop&crop=edges`,
      ];
    }
    return base;
  })();

  return (
    <div className="max-w-[1720px] mx-auto px-6 sm:px-8 lg:px-12 py-6 lg:py-8">
      {/* Breadcrumb row */}
      <div className="flex items-center justify-between border-b border-black/[0.08] pb-4 mb-8">
        <div className="flex items-center space-x-2 text-[10px] tracking-[0.25em] uppercase text-neutral-400">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span>/</span>
          <Link
            href={product.category === "Men" ? "/men" : "/women"}
            className="hover:text-black"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-black font-semibold truncate max-w-xs">
            {product.title}
          </span>
        </div>

        <button
          onClick={() => router.back()}
          className="flex items-center space-x-1.5 text-[10px] tracking-[0.2em] uppercase text-neutral-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>
      </div>

      {/*
        Split-Screen Product Layout
        Both columns scroll together with normal page scroll.
        The right column uses position: sticky with a dynamically
        calculated top value (bi-directional sticky) so it naturally
        stops at the top or bottom edge of the viewport.
      */}
      <main className="product-layout flex flex-col lg:flex-row gap-10 xl:gap-16 items-start">
        {/*
          LEFT COLUMN: Product Media / Gallery
          - Multiple product images stacked vertically
          - Natural content height, drives the overall page scroll length
          - Responsive width, stable aspect ratio (3:4)
        */}
        <section
          aria-label="Product Gallery"
          className="product-media w-full lg:w-[58%] xl:w-[60%] space-y-6 md:space-y-8"
        >
          {galleryImages.map((imgSrc, index) => (
            <div
              key={index}
              className="bg-[#edeae4] overflow-hidden aspect-[3/4] shadow-sm relative group"
            >
              <img
                src={imgSrc}
                alt={`${product.title} editorial look ${index + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 font-mono select-none">
                LOOK 0{index + 1}
              </span>
            </div>
          ))}
        </section>

        {/*
          RIGHT COLUMN: Product Information Panel
          - Uses bi-directional sticky: scrolls WITH the page naturally,
            sticks at bottom when scrolling down, sticks at top when scrolling up.
          - NO separate scroll container, NO overflow-y, NO independent scrolling.
          - align-self: flex-start ensures correct sticky behavior in flex layout.
          - On mobile (<lg), falls back to normal flowing column.
        */}
        <aside
          ref={infoRef}
          aria-label="Product Information"
          className="product-information w-full lg:w-[42%] xl:w-[40%] lg:sticky lg:self-start space-y-8 lg:py-2 lg:pr-3"
        >
          {/* Header & Title with Wishlist Icon */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center space-x-3">
                <span className="bg-black text-white text-[9px] tracking-[0.25em] uppercase font-semibold px-2.5 py-1">
                  {product.category}&apos;s High Fashion
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 font-mono">
                  REF: {product.id.slice(0, 10).toUpperCase()}
                </span>
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label={
                  isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"
                }
                title={isWishlisted ? "In your Wishlist" : "Add to Wishlist"}
                className={`p-2.5 rounded-full border transition-all shrink-0 ${
                  isWishlisted
                    ? "bg-black text-white border-black"
                    : "border-black/15 hover:border-black text-neutral-500 hover:text-black bg-transparent"
                }`}
              >
                <Heart
                  size={15}
                  className={`transition-transform duration-200 ${
                    isWishlisted ? "fill-white scale-110" : ""
                  }`}
                />
              </button>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl tracking-[0.08em] uppercase font-normal text-neutral-900 mt-3 leading-tight">
              {product.title}
            </h1>

            <div className="text-xl font-sans tracking-wide text-neutral-900 mt-4 font-light">
              {formattedPrice}
            </div>
          </div>

          {/* Color / Variant Selector */}
          <div>
            <div className="flex items-center justify-between mb-3 text-[11px] uppercase tracking-[0.2em]">
              <span className="font-semibold text-neutral-800">
                Color:{" "}
                <span className="font-normal text-neutral-500">
                  {selectedColor}
                </span>
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {COLOR_VARIANTS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  aria-label={`Select color ${c.name}`}
                  className={`group relative flex items-center justify-center w-8 h-8 rounded-full border transition-all ${
                    selectedColor === c.name
                      ? "ring-2 ring-black ring-offset-2 ring-offset-[#fafaf8] border-black"
                      : "border-black/20 hover:border-black"
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-full border border-black/10"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-3 text-[11px] uppercase tracking-[0.2em]">
              <span className="font-semibold text-neutral-800">
                Select Size
              </span>
              <span className="text-neutral-400 text-[10px] underline cursor-pointer hover:text-black">
                Size Guide
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {SIZES.map((size) => {
                const isAvailable = availableSizesList.includes(size);
                const isSelected = currentSize === size;

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-[12px] uppercase font-semibold tracking-wider border transition-all relative ${
                      !isAvailable
                        ? "bg-neutral-100 text-neutral-300 border-neutral-200 cursor-not-allowed opacity-60"
                        : isSelected
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
                    }`}
                  >
                    <span>{size}</span>
                    {!isAvailable && (
                      <span className="block text-[8px] font-normal tracking-widest text-neutral-400">
                        OUT
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {availableSizesList.length === 0 && (
              <p className="text-[11px] text-amber-800 mt-2 font-light">
                All sizes for this bespoke creation are currently reserved.
              </p>
            )}
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

          {/* Digital Advisor Assistance Callout */}
          <div className="pt-2 text-[13px] text-neutral-600 font-light leading-relaxed">
            <p>
              Contact our Digital Concierge for tailored styling guidance,
              private salon reservations, or size inquiries.{" "}
              <a
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                  `Hello MOZART Concierge, I have an inquiry regarding ${product.title} (REF: ${product.id.slice(0, 10).toUpperCase()}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-900 underline underline-offset-4 hover:opacity-75 transition-opacity"
              >
                Contact Concierge.
              </a>
            </p>
          </div>

          {/* Product Description with Toggle */}
          <div className="space-y-2 pt-1">
            <p
              className={`text-[13px] text-neutral-600 font-light leading-relaxed transition-all duration-300 ${
                isDescExpanded ? "" : "line-clamp-3"
              }`}
            >
              {product.description ||
                "Rendered in exquisite haute couture craftsmanship, this silhouette captures modern structuralism and timeless Parisian poise. Each piece is individually tailored using master heritage techniques."}
            </p>
            <button
              type="button"
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="text-[13px] text-neutral-900 font-medium underline underline-offset-4 hover:opacity-75 transition-opacity cursor-pointer block"
            >
              {isDescExpanded ? "Read less" : "Read more"}
            </button>
          </div>

          {/* Luxury Information Accordion (Sustainability, Product Care, Boutique Availability) */}
          <div className="border-t border-neutral-200 mt-6 divide-y divide-neutral-200">
            {/* Sustainability */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("sustainability")}
                className="w-full py-4 flex items-center justify-between text-left group transition-colors"
              >
                <span className="text-[14px] text-neutral-900 font-normal tracking-wide group-hover:opacity-75">
                  Sustainability
                </span>
                <span className="text-neutral-700 shrink-0 ml-4">
                  {openSection === "sustainability" ? (
                    <Minus size={16} strokeWidth={1.5} />
                  ) : (
                    <Plus size={16} strokeWidth={1.5} />
                  )}
                </span>
              </button>
              {openSection === "sustainability" && (
                <div className="pb-5 pt-1 text-[13px] text-neutral-600 font-light leading-relaxed animate-fadeIn whitespace-pre-line">
                  {product.sustainability ||
                    "MOZART is committed to environmental stewardship and artisanal preservation. Every material is sustainably sourced and certified by international ecology benchmarks, minimizing carbon footprint and packaged in 100% recyclable materials from sustainably managed forests."}
                </div>
              )}
            </div>

            {/* Product Care */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("product_care")}
                className="w-full py-4 flex items-center justify-between text-left group transition-colors"
              >
                <span className="text-[14px] text-neutral-900 font-normal tracking-wide group-hover:opacity-75">
                  Product Care
                </span>
                <span className="text-neutral-700 shrink-0 ml-4">
                  {openSection === "product_care" ? (
                    <Minus size={16} strokeWidth={1.5} />
                  ) : (
                    <Plus size={16} strokeWidth={1.5} />
                  )}
                </span>
              </button>
              {openSection === "product_care" && (
                <div className="pb-5 pt-1 text-[13px] text-neutral-600 font-light leading-relaxed animate-fadeIn whitespace-pre-line">
                  {product.product_care ||
                    "To maintain the pristine silhouette and material longevity:\n• Store in breathable cotton garment bag in a temperate, dry environment.\n• Avoid direct contact with moisture, cosmetic sprays, and intense prolonged UV exposure.\n• Professional specialized eco-dry cleaning recommended."}
                </div>
              )}
            </div>

            {/* Boutique Availability */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("boutique_availability")}
                className="w-full py-4 flex items-center justify-between text-left group transition-colors"
              >
                <span className="text-[14px] text-neutral-900 font-normal tracking-wide group-hover:opacity-75">
                  Boutique Availability
                </span>
                <span className="text-neutral-700 shrink-0 ml-4">
                  {openSection === "boutique_availability" ? (
                    <Minus size={16} strokeWidth={1.5} />
                  ) : (
                    <Plus size={16} strokeWidth={1.5} />
                  )}
                </span>
              </button>
              {openSection === "boutique_availability" && (
                <div className="pb-5 pt-1 text-[13px] text-neutral-600 font-light leading-relaxed animate-fadeIn whitespace-pre-line">
                  {product.boutique_availability ||
                    "This bespoke piece is available for private appointments at MOZART Flagship Salons:\n• Paris: 12 Place Vendôme (Private Atelier)\n• Milan: Via Montenapoleone 8\n• Tokyo: Ginza 6 Studio\n• New York: Madison Avenue Flagship\nContact our Digital Concierge to reserve a private salon viewing or verify immediate regional sizing."}
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Provenance Trust Signals */}
          <div className="pt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-neutral-500 font-light">
            <span className="flex items-center space-x-1.5">
              <Truck size={13} className="text-neutral-700" />
              <span>Complimentary Express Courier</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <ShieldCheck size={13} className="text-neutral-700" />
              <span>NFC Authenticated Piece</span>
            </span>
          </div>
        </aside>
      </main>
    </div>
  );
}
