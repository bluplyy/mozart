"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Search, User } from "lucide-react";
import { useState, useRef } from "react";
import MenuSidebar from "./MenuSidebar";

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCategory, setSidebarCategory] = useState<"women" | "men">("women");
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterNav = (cat: "women" | "men") => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSidebarCategory(cat);
    setSidebarOpen(true);
  };

  const handleMouseLeaveNav = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setSidebarOpen(false);
    }, 250);
  };

  const handleSidebarMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleSidebarMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setSidebarOpen(false);
    }, 200);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#fafaf8]/90 backdrop-blur-md border-b border-black/[0.06]">
        {/* Top micro announcement */}
        <div className="bg-[#09090b] text-[#fafaf8] text-[10px] tracking-[0.25em] uppercase py-2 text-center font-sans font-medium">
          Complimentary Worldwide Courier & Signature Studio Wrapping
        </div>

        {/* Main navigation row */}
        <div className="max-w-[1720px] mx-auto px-8 h-20 flex items-center justify-between">
          {/* Left: Collections Navigation */}
          <nav className="flex items-center space-x-7 md:space-x-9 text-[12px] uppercase tracking-[0.2em] font-medium">
            <Link
              href="/women"
              onMouseEnter={() => handleMouseEnterNav("women")}
              onMouseLeave={handleMouseLeaveNav}
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
              onMouseEnter={() => handleMouseEnterNav("men")}
              onMouseLeave={handleMouseLeaveNav}
              className={`relative py-1 hover:text-black transition-colors ${
                isActive("/men")
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
              {isAuthenticated ? (user?.name?.split(" ")[0] || "Account") : "Sign In"}
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

      {/* Slide-in Menu Sidebar */}
      <MenuSidebar
        isOpen={sidebarOpen}
        activeCategory={sidebarCategory}
        onClose={() => setSidebarOpen(false)}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        onSwitchCategory={(cat) => setSidebarCategory(cat)}
      />
    </>
  );
}
