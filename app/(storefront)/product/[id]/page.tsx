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
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { products, loading } = useProducts();
  const { addToCart } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [added, setAdded] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

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
    addToCart(product, currentSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(product.price);

  const SIZES = ["L", "XL", "M", "S", "XS"];
  const availableSizesList = product.available_sizes || ["L", "XL", "M", "S", "XS"];

  // Initialize selectedSize to first available size if current is not available
  const currentSize = availableSizesList.includes(selectedSize) 
    ? selectedSize 
    : (availableSizesList[0] || "M");

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image_url, ...(product.secondary_image_url ? [product.secondary_image_url] : [])].filter(Boolean);

  const safeImageIndex = activeImageIndex < galleryImages.length ? activeImageIndex : 0;

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
      <div className="grid grid-cols-12 gap-8 lg:gap-16 items-start">
        {/* Left Column: Contained Editorial Gallery & Interactive Showcase (7 cols) */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          {/* Main Showcase Image */}
          <div className="bg-[#edeae4] overflow-hidden aspect-[3/4] max-h-[76vh] w-full shadow-sm relative group flex items-center justify-center">
            <img
              src={galleryImages[safeImageIndex] || product.image_url}
              alt={`${product.title} view ${safeImageIndex + 1}`}
              className="w-full h-full object-cover object-center transition-all duration-300 ease-out"
            />

            {/* Look Tag Badge */}
            <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-[9px] tracking-[0.2em] uppercase px-3 py-1 font-mono">
              LOOK 0{safeImageIndex + 1} / 0{galleryImages.length}
            </span>

            {/* Previous / Next Chevrons */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === 0 ? galleryImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  aria-label="Previous Look"
                >
                  <ChevronLeft size={20} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === galleryImages.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-black flex items-center justify-center shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  aria-label="Next Look"
                >
                  <ChevronRight size={20} strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip for Multi-View Looks */}
          {galleryImages.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 pt-1 luxury-scroll">
              {galleryImages.map((imgSrc, idx) => {
                const isActive = safeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 aspect-[3/4] bg-[#edeae4] overflow-hidden shrink-0 border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-black ring-1 ring-black opacity-100 scale-105"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={imgSrc}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[7px] font-mono px-1 py-0.5">
                      0{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Sticky & Independently Scrollable Purchasing Details (5 cols) */}
        <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto overscroll-contain luxury-scroll pr-3 pl-0 lg:pl-4 space-y-6">
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

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-3 text-[11px] uppercase tracking-[0.2em]">
              <span className="font-semibold text-neutral-800">Select Size</span>
              <span className="text-neutral-400 text-[10px] underline cursor-pointer">
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
                Saat ini semua ukuran untuk piece ini sedang habis.
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
              Hubungi Digital Advisor kami yang tersedia jika ada pertanyaan mengenai produk ini.{" "}
              <a
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                  `Halo Digital Advisor MOZART, saya memiliki pertanyaan mengenai piece ${product.title} (REF: ${product.id.slice(0, 10).toUpperCase()}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-900 underline underline-offset-4 hover:opacity-75 transition-opacity"
              >
                Hubungi kami.
              </a>
            </p>
          </div>

          {/* Product Description with 'Baca lebih lanjut' Toggle */}
          <div className="space-y-2 pt-1">
            <p
              className={`text-[13px] text-neutral-600 font-light leading-relaxed transition-all duration-300 ${
                isDescExpanded ? "" : "line-clamp-3"
              }`}
            >
              {product.description ||
                "Neverfull MM hadir kembali dalam Monogram Emblème khas Rumah Mode, dibuat dari bahan sensorial jacquard yang terinspirasi dari canvas orisinal tahun 1896. Tas ini menyatukan keahlian pengerjaan atelier dengan siluet kontemporer yang abadi."}
            </p>
            <button
              type="button"
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="text-[13px] text-neutral-900 font-medium underline underline-offset-4 hover:opacity-75 transition-opacity cursor-pointer block"
            >
              {isDescExpanded ? "Tampilkan lebih sedikit" : "Baca lebih lanjut"}
            </button>
          </div>

          {/* Luxury Information Accordion (Sustainability, Product Care, Butik) */}
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
                    "MOZART berkomitmen terhadap keberlanjutan dan pelestarian lingkungan hidup. Setiap helai bahan diproduksi secara bertanggung jawab dengan sertifikasi standar lingkungan internasional, meminimalisir jejak karbon, serta menggunakan kemasan 100% dapat didaur ulang yang berasal dari hutan terkelola lestari."}
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
                    "Untuk menjaga keindahan dan daya tahan busana haute couture ini:\n• Simpan dalam dust bag katun berpori di ruangan dengan suhu sejuk dan stabil.\n• Hindari paparan langsung air, cairan kimiawi, parfum, dan sinar matahari berlebih.\n• Disarankan perawatan melalui dry cleaning profesional bersertifikasi haute couture."}
                </div>
              )}
            </div>

            {/* Lihat ketersediaan di butik */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection("boutique_availability")}
                className="w-full py-4 flex items-center justify-between text-left group transition-colors"
              >
                <span className="text-[14px] text-neutral-900 font-normal tracking-wide group-hover:opacity-75">
                  Lihat ketersediaan di butik
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
                    "Koleksi ini tersedia untuk reservasi privat di butik resmi MOZART:\n• Jakarta: Plaza Indonesia, Level 1 (Atelier Boutique)\n• Paris: 12 Place Vendôme (Private Salon)\n• Milan: Via Montenapoleone\nSilakan hubungi Digital Advisor kami untuk menjadwalkan janji temu atau memastikan ketersediaan ukuran."}
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Provenance Trust Signals */}
          <div className="pt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-neutral-500 font-light">
            <span className="flex items-center space-x-1.5">
              <Truck size={13} className="text-neutral-700" />
              <span>Complimentary DHL Express</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <ShieldCheck size={13} className="text-neutral-700" />
              <span>NFC Certified Piece</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
