"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Search, User } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import MenuSidebar from "./MenuSidebar";

interface FlipItemCoord {
  baseLeft: number;
  baseTop: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
}

interface FlipTransitionState {
  women: FlipItemCoord;
  men: FlipItemCoord;
  inFlight: boolean;
  category: "women" | "men";
}

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sidebar & FLIP transition state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCategory, setSidebarCategory] = useState<"women" | "men">("women");
  const [flipState, setFlipState] = useState<"idle" | "opening" | "open" | "closing">("idle");
  const [flipData, setFlipData] = useState<FlipTransitionState | null>(null);

  // DOM Refs for FLIP coordinate calculation
  const asideRef = useRef<HTMLElement | null>(null);
  const womenSidebarRef = useRef<HTMLButtonElement | null>(null);
  const menSidebarRef = useRef<HTMLButtonElement | null>(null);
  const womenNavRef = useRef<HTMLAnchorElement | null>(null);
  const menNavRef = useRef<HTMLAnchorElement | null>(null);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  // Clean up all timers and animation frames on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (flightTimeoutRef.current) clearTimeout(flightTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const triggerFlipOpen = useCallback((cat: "women" | "men") => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (flightTimeoutRef.current) {
      clearTimeout(flightTimeoutRef.current);
      flightTimeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // If sidebar is already fully open, just change category
    if (sidebarOpen && flipState === "open") {
      setSidebarCategory(cat);
      return;
    }

    const womenNav = womenNavRef.current;
    const menNav = menNavRef.current;
    const womenSide = womenSidebarRef.current;
    const menSide = menSidebarRef.current;
    const aside = asideRef.current;

    if (!womenNav || !menNav || !womenSide || !menSide || !aside) {
      setSidebarCategory(cat);
      setSidebarOpen(true);
      setFlipState("open");
      return;
    }

    // Measure FIRST: Navbar positions in viewport
    const womenNavRect = womenNav.getBoundingClientRect();
    const menNavRect = menNav.getBoundingClientRect();

    // Measure LAST: Sidebar resting coordinates (aside resting left is 0)
    const asideRect = aside.getBoundingClientRect();
    const womenSideRect = womenSide.getBoundingClientRect();
    const menSideRect = menSide.getBoundingClientRect();

    const restingWomenLeft = womenSideRect.left - asideRect.left;
    const restingWomenTop = womenSideRect.top - asideRect.top;
    const restingMenLeft = menSideRect.left - asideRect.left;
    const restingMenTop = menSideRect.top - asideRect.top;

    // INVERT: delta from resting to initial navbar position
    const dxWomen = womenNavRect.left - restingWomenLeft;
    const dyWomen = womenNavRect.top - restingWomenTop;
    const dxMen = menNavRect.left - restingMenLeft;
    const dyMen = menNavRect.top - restingMenTop;

    const data: FlipTransitionState = {
      women: {
        baseLeft: restingWomenLeft,
        baseTop: restingWomenTop,
        width: womenNavRect.width,
        height: womenNavRect.height,
        dx: dxWomen,
        dy: dyWomen,
      },
      men: {
        baseLeft: restingMenLeft,
        baseTop: restingMenTop,
        width: menNavRect.width,
        height: menNavRect.height,
        dx: dxMen,
        dy: dyMen,
      },
      inFlight: false,
      category: cat,
    };

    setFlipData(data);
    setFlipState("opening");
    setSidebarCategory(cat);
    setSidebarOpen(true);

    // PLAY: Trigger flight transform on next frame
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setFlipData((prev) => (prev ? { ...prev, inFlight: true } : null));
      });
    });

    // Complete transition after 500ms
    flightTimeoutRef.current = setTimeout(() => {
      setFlipState("open");
      setFlipData(null);
    }, 500);
  }, [sidebarOpen, flipState]);

  const triggerFlipClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (flightTimeoutRef.current) {
      clearTimeout(flightTimeoutRef.current);
      flightTimeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (!sidebarOpen && flipState === "idle") return;

    const womenNav = womenNavRef.current;
    const menNav = menNavRef.current;
    const womenSide = womenSidebarRef.current;
    const menSide = menSidebarRef.current;
    const aside = asideRef.current;

    if (!womenNav || !menNav || !womenSide || !menSide || !aside) {
      setSidebarOpen(false);
      setFlipState("idle");
      setFlipData(null);
      return;
    }

    // TARGET: Navbar position
    const womenNavRect = womenNav.getBoundingClientRect();
    const menNavRect = menNav.getBoundingClientRect();

    // ORIGIN: Current sidebar button position
    const womenSideRect = womenSide.getBoundingClientRect();
    const menSideRect = menSide.getBoundingClientRect();

    // INVERT: delta from navbar target to current sidebar origin
    const dxWomen = womenSideRect.left - womenNavRect.left;
    const dyWomen = womenSideRect.top - womenNavRect.top;
    const dxMen = menSideRect.left - menNavRect.left;
    const dyMen = menSideRect.top - menNavRect.top;

    const targetCategory =
      pathname === "/men"
        ? "men"
        : pathname === "/women"
        ? "women"
        : sidebarCategory;

    const data: FlipTransitionState = {
      women: {
        baseLeft: womenNavRect.left,
        baseTop: womenNavRect.top,
        width: womenNavRect.width,
        height: womenNavRect.height,
        dx: dxWomen,
        dy: dyWomen,
      },
      men: {
        baseLeft: menNavRect.left,
        baseTop: menNavRect.top,
        width: menNavRect.width,
        height: menNavRect.height,
        dx: dxMen,
        dy: dyMen,
      },
      inFlight: false,
      category: targetCategory,
    };

    setFlipData(data);
    setFlipState("closing");
    setSidebarOpen(false);

    // PLAY: Trigger flight transform back to navbar
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setFlipData((prev) => (prev ? { ...prev, inFlight: true } : null));
      });
    });

    // Complete reverse flight after 500ms
    flightTimeoutRef.current = setTimeout(() => {
      setFlipState("idle");
      setFlipData(null);
    }, 500);
  }, [sidebarOpen, flipState, pathname, sidebarCategory]);

  const handleMouseEnterNav = (cat: "women" | "men") => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (sidebarOpen && flipState === "open") {
      setSidebarCategory(cat);
    } else {
      triggerFlipOpen(cat);
    }
  };

  const handleMouseLeaveNav = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      triggerFlipClose();
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
      triggerFlipClose();
    }, 200);
  };

  const handleClickNav = (e: React.MouseEvent, cat: "women" | "men") => {
    if (!sidebarOpen) {
      e.preventDefault();
      triggerFlipOpen(cat);
    }
  };

  const isActive = (path: string) => pathname === path;
  const isFlippingOrOpen = flipState !== "idle";

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
              ref={womenNavRef}
              href="/women"
              onMouseEnter={() => handleMouseEnterNav("women")}
              onMouseLeave={handleMouseLeaveNav}
              onClick={(e) => handleClickNav(e, "women")}
              className={`relative py-1 hover:text-black transition-colors ${
                isActive("/women")
                  ? "text-black font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-black"
                  : "text-neutral-500"
              } ${isFlippingOrOpen ? "opacity-0 pointer-events-none transition-none" : "opacity-100"}`}
            >
              Women
            </Link>

            <Link
              ref={menNavRef}
              href="/men"
              onMouseEnter={() => handleMouseEnterNav("men")}
              onMouseLeave={handleMouseLeaveNav}
              onClick={(e) => handleClickNav(e, "men")}
              className={`relative py-1 hover:text-black transition-colors ${
                isActive("/men")
                  ? "text-black font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-black"
                  : "text-neutral-500"
              } ${isFlippingOrOpen ? "opacity-0 pointer-events-none transition-none" : "opacity-100"}`}
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

      {/* FLIP Shared-Element Flying Stage */}
      {flipData && (
        <div
          className="fixed inset-0 pointer-events-none z-[60] overflow-hidden"
          aria-hidden="true"
        >
          {/* Flying Women */}
          <div
            style={{
              position: "fixed",
              left: `${flipData.women.baseLeft}px`,
              top: `${flipData.women.baseTop}px`,
              width: `${flipData.women.width}px`,
              height: `${flipData.women.height}px`,
              transform: flipData.inFlight
                ? "translate3d(0, 0, 0)"
                : `translate3d(${flipData.women.dx}px, ${flipData.women.dy}px, 0)`,
              transition: flipData.inFlight
                ? "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
              willChange: "transform",
            }}
            className={`flex items-center relative py-1 text-[12px] uppercase tracking-[0.2em] whitespace-nowrap select-none ${
              flipData.category === "women"
                ? "text-black font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-black"
                : "text-neutral-500 font-medium"
            }`}
          >
            Women
          </div>

          {/* Flying Men */}
          <div
            style={{
              position: "fixed",
              left: `${flipData.men.baseLeft}px`,
              top: `${flipData.men.baseTop}px`,
              width: `${flipData.men.width}px`,
              height: `${flipData.men.height}px`,
              transform: flipData.inFlight
                ? "translate3d(0, 0, 0)"
                : `translate3d(${flipData.men.dx}px, ${flipData.men.dy}px, 0)`,
              transition: flipData.inFlight
                ? "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
              willChange: "transform",
            }}
            className={`flex items-center relative py-1 text-[12px] uppercase tracking-[0.2em] whitespace-nowrap select-none ${
              flipData.category === "men"
                ? "text-black font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-black"
                : "text-neutral-500 font-medium"
            }`}
          >
            Men
          </div>
        </div>
      )}

      {/* Slide-in Menu Sidebar */}
      <MenuSidebar
        isOpen={sidebarOpen}
        activeCategory={sidebarCategory}
        onClose={triggerFlipClose}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        onSwitchCategory={(cat) => setSidebarCategory(cat)}
        asideRef={asideRef}
        womenRef={womenSidebarRef}
        menRef={menSidebarRef}
        hideMenuItems={flipState !== "open"}
      />
    </>
  );
}
