"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Search, User } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
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
  const [navOffset, setNavOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs for FLIP coordinates & elements
  const navRef = useRef<HTMLElement | null>(null);
  const landingSlotRef = useRef<HTMLDivElement | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compute offset from navbar home to sidebar drawer slot
  const computeOffset = useCallback(() => {
    const nav = navRef.current;
    const slot = landingSlotRef.current;
    const aside = asideRef.current;

    if (!nav || !slot || !aside) return null;

    const navRect = nav.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    const asideRect = aside.getBoundingClientRect();

    // Resting coordinates of slot when aside is open at left: 0
    const targetLeft = slotRect.left - asideRect.left;
    const targetTop = slotRect.top - asideRect.top;

    // Untransformed (natural) position of nav in viewport
    const naturalLeft = navRect.left - navOffset.x;
    const naturalTop = navRect.top - navOffset.y;

    return {
      x: Math.round(targetLeft - naturalLeft),
      y: Math.round(targetTop - naturalTop),
    };
  }, [navOffset]);

  const triggerOpen = useCallback(
    (cat: "women" | "men") => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      setSidebarCategory(cat);

      if (sidebarOpen) return;

      const offset = computeOffset();
      if (offset) {
        setNavOffset(offset);
      }
      setSidebarOpen(true);
    },
    [sidebarOpen, computeOffset]
  );

  const triggerClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSidebarOpen(false);
    setNavOffset({ x: 0, y: 0 });
  }, []);

  // Update offset dynamically on window resize if sidebar is currently open
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleResize = () => {
      const offset = computeOffset();
      if (offset) setNavOffset(offset);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen, computeOffset]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Mouse hover handlers
  const handleMouseEnterNav = (cat: "women" | "men") => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (sidebarOpen) {
      setSidebarCategory(cat);
    } else {
      triggerOpen(cat);
    }
  };

  const handleMouseLeaveNav = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      triggerClose();
    }, 250);
  };

  const handleSidebarMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleSidebarMouseLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      triggerClose();
    }, 200);
  };

  const handleClickNav = (e: React.MouseEvent, cat: "women" | "men") => {
    e.preventDefault();
    if (sidebarOpen) {
      setSidebarCategory(cat);
    } else {
      triggerOpen(cat);
    }
  };

  // Determine active underline indicator
  const currentCategory = sidebarOpen
    ? sidebarCategory
    : pathname === "/women"
    ? "women"
    : pathname === "/men"
    ? "men"
    : null;

  return (
    <>
      <header className="sticky top-0 z-[60] pointer-events-none">
        {/* Header background with smooth fade on open */}
        <div
          className={`absolute inset-0 bg-[#fafaf8]/90 backdrop-blur-md border-b border-black/[0.06] transition-opacity duration-500 pointer-events-none ${
            sidebarOpen ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Top micro announcement */}
        <div
          className={`relative bg-[#09090b] text-[#fafaf8] text-[10px] tracking-[0.25em] uppercase py-2 text-center font-sans font-medium transition-opacity duration-500 pointer-events-auto ${
            sidebarOpen ? "opacity-30" : "opacity-100"
          }`}
        >
          Complimentary Worldwide Courier & Signature Studio Wrapping
        </div>

        {/* Main navigation row */}
        <div className="relative max-w-[1720px] mx-auto px-8 h-20 flex items-center justify-between pointer-events-none">
          {/* Left: Collections Navigation - SAME CONTINUOUS DOM ELEMENT with FLIP translate */}
          <nav
            ref={navRef}
            style={{
              transform:
                navOffset.x !== 0 || navOffset.y !== 0
                  ? `translate3d(${navOffset.x}px, ${navOffset.y}px, 0)`
                  : "translate3d(0, 0, 0)",
              transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "transform",
            }}
            className="relative z-10 flex items-center space-x-7 md:space-x-9 text-[12px] uppercase tracking-[0.2em] font-medium pointer-events-auto"
          >
            <Link
              href="/women"
              onMouseEnter={() => handleMouseEnterNav("women")}
              onMouseLeave={handleMouseLeaveNav}
              onClick={(e) => handleClickNav(e, "women")}
              className={`relative py-1 transition-colors ${
                currentCategory === "women"
                  ? "text-black font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-black"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Women
            </Link>

            <Link
              href="/men"
              onMouseEnter={() => handleMouseEnterNav("men")}
              onMouseLeave={handleMouseLeaveNav}
              onClick={(e) => handleClickNav(e, "men")}
              className={`relative py-1 transition-colors ${
                currentCategory === "men"
                  ? "text-black font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-black"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Men
            </Link>
          </nav>

          {/* Center: Brand Wordmark */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 text-center transition-opacity duration-500 ${
              sidebarOpen
                ? "opacity-30 pointer-events-none"
                : "opacity-100 pointer-events-auto"
            }`}
          >
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
          <div
            className={`flex items-center space-x-7 transition-opacity duration-500 ${
              sidebarOpen
                ? "opacity-30 pointer-events-none"
                : "opacity-100 pointer-events-auto"
            }`}
          >
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

      {/* Slide-in Menu Sidebar */}
      <MenuSidebar
        isOpen={sidebarOpen}
        activeCategory={sidebarCategory}
        onClose={triggerClose}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        asideRef={asideRef}
        landingSlotRef={landingSlotRef}
      />
    </>
  );
}
