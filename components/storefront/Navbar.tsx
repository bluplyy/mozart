"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Search, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import MenuSidebar from "./MenuSidebar";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sidebar visibility and active category
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCategory, setSidebarCategory] = useState<"women" | "men">("women");

  const headerRef = useRef<HTMLElement | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Measure and keep --header-height CSS variable in sync across zoom levels and resizes
  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const updateHeight = () => {
      const height = headerEl.getBoundingClientRect().height;
      if (height > 0) {
        document.documentElement.style.setProperty("--header-height", `${Math.round(height)}px`);
      }
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });
    observer.observe(headerEl);

    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  // Clear pending timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Hover handlers for navbar menu items
  const handleMouseEnterNav = (cat: "women" | "men") => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSidebarCategory(cat);
    setSidebarOpen(true);
  };

  const handleMouseLeaveNav = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setSidebarOpen(false);
    }, 220);
  };

  // Hover handlers for the sidebar drawer to keep it open while browsing
  const handleSidebarMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleSidebarMouseLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setSidebarOpen(false);
    }, 180);
  };

  // Determine active underline indicator:
  // While sidebar is open, highlight the active category in the sidebar.
  // While closed, highlight the current route.
  const isCategoryActive = (cat: "women" | "men") => {
    if (sidebarOpen) {
      return sidebarCategory === cat;
    }
    return (
      (cat === "women" && pathname === "/women") ||
      (cat === "men" && pathname === "/men")
    );
  };

  return (
    <>
      {/*
        PERMANENT, STATIC NAVBAR HEADER
        z-index: 50 — sits above the sidebar layer (z-40) and backdrop (z-30).
        Dimensions, layout, font sizes, and positions NEVER move or resize.
      */}
      <header ref={headerRef} className="sticky top-0 z-50 bg-[#fafaf8]/90 backdrop-blur-md border-b border-black/[0.06]">
        {/* Top micro announcement */}
        <div className="bg-[#09090b] text-[#fafaf8] text-[10px] tracking-[0.25em] uppercase py-2 text-center font-sans font-medium select-none">
          Complimentary Worldwide Courier & Signature Studio Wrapping
        </div>

        {/* Main navigation row */}
        <div className="max-w-[1720px] mx-auto px-8 h-20 flex items-center justify-between">
          {/* Left: Collections Navigation - Permanent, static DOM elements */}
          <nav className="flex items-center space-x-7 md:space-x-9 text-[12px] uppercase tracking-[0.2em] font-medium">
            <Link
              href="/women"
              onMouseEnter={() => handleMouseEnterNav("women")}
              onMouseLeave={handleMouseLeaveNav}
              onClick={() => setSidebarOpen(false)}
              className={`relative py-1 hover:text-black transition-colors ${
                isCategoryActive("women")
                  ? "text-black font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-black"
                  : "text-neutral-500"
              }`}
            >
              Women
            </Link>

            <Link
              href="/men"
              onMouseEnter={() => handleMouseEnterNav("men")}
              onMouseLeave={handleMouseLeaveNav}
              onClick={() => setSidebarOpen(false)}
              className={`relative py-1 hover:text-black transition-colors ${
                isCategoryActive("men")
                  ? "text-black font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-black"
                  : "text-neutral-500"
              }`}
            >
              Men
            </Link>
          </nav>

          {/* Center: Brand Wordmark */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="group flex flex-col items-center justify-center cursor-pointer"
            >
              <span className="font-serif text-3xl md:text-4xl tracking-[0.35em] text-[#09090b] uppercase font-normal select-none">
                MOZART
              </span>
            </Link>
          </div>

          {/* Right: Actions (Search, Bag, Admin Studio) */}
          <div className="flex items-center space-x-7">
            <div className="relative flex items-center">
              {searchOpen ? (
                <div className="flex items-center border-b border-black pb-1">
                  <input
                    type="text"
                    placeholder="SEARCH ARCHIVE..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-[11px] tracking-[0.15em] outline-none w-36 uppercase"
                    autoFocus
                    onBlur={() => !searchQuery && setSearchOpen(false)}
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="text-[10px] text-neutral-400 hover:text-black ml-2"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center space-x-1.5 text-[11px] tracking-[0.18em] uppercase text-neutral-600 hover:text-black"
                >
                  <Search size={14} strokeWidth={1.5} />
                  <span className="hidden xl:inline">Search</span>
                </button>
              )}
            </div>

            {/* Client Account / Sign In */}
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              className="flex items-center space-x-1.5 text-[11px] tracking-[0.18em] uppercase text-neutral-800 hover:text-black transition-colors"
            >
              <User size={14} strokeWidth={1.5} />
              <span className="hidden xl:inline">
                {isAuthenticated ? user?.name?.split(" ")[0] || "Account" : "Sign In"}
              </span>
            </Link>

            {/* Bag Flyout trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center space-x-2 text-[11px] tracking-[0.18em] uppercase text-neutral-800 hover:text-black group"
            >
              <div className="relative">
                <ShoppingBag size={15} strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </div>
              <span>Bag {totalItems > 0 ? `(${totalItems})` : ""}</span>
            </button>
          </div>
        </div>
      </header>

      {/*
        INDEPENDENT VIVET-STYLE SIDEBAR
        Slides smoothly from left under the sticky navbar
      */}
      <MenuSidebar
        isOpen={sidebarOpen}
        activeCategory={sidebarCategory}
        onClose={() => setSidebarOpen(false)}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      />
    </>
  );
}
