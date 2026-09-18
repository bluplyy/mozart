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

  // Sidebar state — only controls the sidebar, never the navbar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCategory, setSidebarCategory] = useState<"women" | "men">("women");

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = (delayMs: number) => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setSidebarOpen(false);
    }, delayMs);
  };

  const openSidebar = (cat: "women" | "men") => {
    cancelClose();
    setSidebarCategory(cat);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    cancelClose();
    setSidebarOpen(false);
  };

  // Navbar hover handlers — navbar NEVER moves or animates
  const handleNavMouseEnter = (cat: "women" | "men") => {
    cancelClose();
    openSidebar(cat);
  };

  const handleNavMouseLeave = () => {
    scheduleClose(250);
  };

  const handleSidebarMouseEnter = () => {
    cancelClose();
  };

  const handleSidebarMouseLeave = () => {
    scheduleClose(200);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/*
        ─────────────────────────────────────────────────────────────
        NAVBAR — COMPLETELY STATIC. NO TRANSFORMS. NO ANIMATIONS.
        This element must never be involved in any sidebar transition.
        ─────────────────────────────────────────────────────────────
      */}
      <header className="sticky top-0 z-40 bg-[#fafaf8]/90 backdrop-blur-md border-b border-black/[0.06]">
        {/* Top micro announcement */}
        <div className="bg-[#09090b] text-[#fafaf8] text-[10px] tracking-[0.25em] uppercase py-2 text-center font-sans font-medium">
          Complimentary Worldwide Courier &amp; Signature Studio Wrapping
        </div>

        {/* Main navigation row — static layout, never animated */}
        <div className="max-w-[1720px] mx-auto px-8 h-20 flex items-center justify-between">

          {/* Left: Collections Navigation — these items NEVER move */}
          <nav className="flex items-center space-x-7 md:space-x-9 text-[12px] uppercase tracking-[0.2em] font-medium">
            <Link
              href="/women"
              onMouseEnter={() => handleNavMouseEnter("women")}
              onMouseLeave={handleNavMouseLeave}
              className={`relative py-1 hover:text-black transition-colors ${
                isActive("/women")
                  ? "text-black font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-black"
                  : "text-neutral-500"
              }`}
            >
              Women
            </Link>

            <Link
              href="/men"
              onMouseEnter={() => handleNavMouseEnter("men")}
              onMouseLeave={handleNavMouseLeave}
              className={`relative py-1 hover:text-black transition-colors ${
                isActive("/men")
                  ? "text-black font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-black"
                  : "text-neutral-500"
              }`}
            >
              Men
            </Link>
          </nav>

          {/* Center: Brand Wordmark — static */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <Link href="/" className="group flex flex-col items-center justify-center cursor-pointer">
              <span className="font-serif text-3xl md:text-4xl tracking-[0.35em] text-[#09090b] uppercase font-normal select-none">
                MOZART
              </span>
            </Link>
          </div>

          {/* Right: Actions — static */}
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

            {/* Account */}
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              className="flex items-center space-x-1.5 text-[11px] tracking-[0.18em] uppercase text-neutral-800 hover:text-black transition-colors"
            >
              <User size={14} strokeWidth={1.5} />
              <span className="hidden xl:inline">
                {isAuthenticated ? user?.name?.split(" ")[0] || "Account" : "Sign In"}
              </span>
            </Link>

            {/* Bag */}
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
        ─────────────────────────────────────────────────────────────
        SIDEBAR — fully independent fixed-position overlay layer.
        Rendered outside <header>, never affects navbar layout.
        ─────────────────────────────────────────────────────────────
      */}
      <MenuSidebar
        isOpen={sidebarOpen}
        activeCategory={sidebarCategory}
        onClose={closeSidebar}
        onSwitchCategory={(cat) => setSidebarCategory(cat)}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      />
    </>
  );
}
