"use client";

import React, { useEffect } from "react";
import Link from "next/link";

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

  const links = activeCategory === "women" ? WOMEN_LINKS : MEN_LINKS;

  return (
    <>
      {/*
        ─────────────────────────────────────────────────────────────
        BACKDROP OVERLAY (vivetofficial.com style)
        Independent opacity transition: ~300ms
        ─────────────────────────────────────────────────────────────
      */}
      <div
        onClick={onClose}
        style={{
          transition: "opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/*
        ─────────────────────────────────────────────────────────────
        SIDEBAR COLUMN (vivetofficial.com style)
        Independent fixed-position layer on the left:
        Smooth, clean, minimalist subcategories list directly below navbar.
        Animates via transform: translate3d(-100%, 0, 0) → translate3d(0, 0, 0)
        ─────────────────────────────────────────────────────────────
      */}
      <aside
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          transition: "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
        }}
        className={`fixed top-0 left-0 h-[100dvh] z-40 w-72 md:w-80 bg-[#fafaf8] border-r border-black/[0.06] shadow-xl flex flex-col pt-28 md:pt-32 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Sub-navigation Menu"
      >
        {/* Clean, minimalist subcategory links exactly like Vivet */}
        <div className="px-8 py-6">
          <nav className="flex flex-col space-y-4">
            {links.map((item, idx) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                style={{
                  transitionDelay: isOpen ? `${idx * 25 + 40}ms` : "0ms",
                }}
                className={`text-[11px] md:text-[12px] uppercase tracking-[0.2em] font-medium text-neutral-500 hover:text-black transition-all duration-300 ${
                  isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
