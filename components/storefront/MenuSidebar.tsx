"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight, Sparkles } from "lucide-react";

interface SubItem {
  name: string;
  href: string;
}

interface MenuSidebarProps {
  isOpen: boolean;
  activeCategory: "women" | "men";
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  asideRef?: React.RefObject<HTMLElement | null>;
  landingSlotRef?: React.RefObject<HTMLDivElement | null>;
}

const WOMEN_LINKS: SubItem[] = [
  { name: "SHOP ALL WOMEN'S", href: "/women" },
  { name: "TOPS & KNITWEAR", href: "/women?sub=tops" },
  { name: "BOTTOMS", href: "/women?sub=bottoms" },
  { name: "JACKETS & COATS", href: "/women?sub=jackets" },
  { name: "FOOTWEAR", href: "/women?sub=footwear" },
];

const MEN_LINKS: SubItem[] = [
  { name: "SHOP ALL MEN'S", href: "/men" },
  { name: "TOPS & SHIRTING", href: "/men?sub=tops" },
  { name: "BOTTOMS & TROUSERS", href: "/men?sub=bottoms" },
  { name: "JACKETS & COATS", href: "/men?sub=jackets" },
  { name: "FOOTWEAR & BOOTS", href: "/men?sub=footwear" },
];

export default function MenuSidebar({
  isOpen,
  activeCategory,
  onClose,
  onMouseEnter,
  onMouseLeave,
  asideRef,
  landingSlotRef,
}: MenuSidebarProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const category = activeCategory || "women";
  const links = category === "women" ? WOMEN_LINKS : MEN_LINKS;

  return (
    <>
      {/* Dimmed backdrop with smooth luxury fade */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Slide-in Drawer from the Left */}
      <aside
        ref={asideRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`fixed top-0 left-0 bottom-0 z-50 w-full sm:w-[420px] md:w-[460px] bg-[#fafaf8] text-[#09090b] shadow-2xl border-r border-black/[0.08] flex flex-col justify-between transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Navigation Menu"
      >
        {/* Top bar: Landing target slot for the Navbar menu & Close button */}
        <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-black/[0.06]">
          {/* Target landing slot where the real navbar <nav> docks */}
          <div
            ref={landingSlotRef}
            className="flex items-center space-x-7 md:space-x-9 text-[12px] tracking-[0.2em] uppercase font-medium opacity-0 pointer-events-none select-none"
            aria-hidden="true"
          >
            <span className="py-1">Women</span>
            <span className="py-1">Men</span>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 text-neutral-400 hover:text-black transition-colors rounded-full hover:bg-neutral-200/60 pointer-events-auto"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Main Links Body */}
        <div className="flex-1 px-8 py-12 flex flex-col justify-center overflow-y-auto">
          <nav className="space-y-6">
            {links.map((item, idx) => (
              <div
                key={item.name}
                style={{
                  transitionDelay: isOpen ? `${idx * 45 + 100}ms` : "0ms",
                }}
                className={`transform transition-all duration-500 ease-out ${
                  isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-center justify-between py-1 text-[13px] md:text-[14px] font-sans font-medium tracking-[0.2em] text-neutral-900 hover:text-black transition-all"
                >
                  <span className="relative">
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full" />
                  </span>
                  <ArrowRight
                    size={14}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-neutral-400 group-hover:text-black"
                  />
                </Link>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Drawer Footer: Editorial Studio Note */}
        <div className="px-8 py-8 border-t border-black/[0.06] bg-[#f4f3ee]/60">
          <div className="flex items-center space-x-2 text-[10px] tracking-[0.25em] uppercase text-neutral-500 font-semibold mb-2">
            <Sparkles size={12} className="text-neutral-700" />
            <span>MOZART High Fashion</span>
          </div>
          <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
            Curated seasonal collections crafted in Biella, Florence, and Paris. Handcrafted in strictly numbered editions.
          </p>
          <div className="mt-4 pt-4 border-t border-black/[0.05] flex items-center justify-between text-[10px] font-mono tracking-widest text-neutral-400">
            <span>PARIS STUDIO</span>
            <span>12 VENDOME SQUARE</span>
          </div>
        </div>
      </aside>
    </>
  );
}
