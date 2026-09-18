"use client";

import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Trash2, ShieldCheck, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    clearCart,
  } = useCart();

  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    const randomRef = `MZT-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderRef(randomRef);
    setCheckoutComplete(true);
    clearCart();
  };

  const formattedSubtotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={() => {
          setIsCartOpen(false);
          setCheckoutComplete(false);
        }}
      />

      {/* Slide-out Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-[#fafaf8] shadow-2xl flex flex-col border-l border-neutral-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-black/[0.07] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-serif tracking-[0.2em] text-lg uppercase font-medium">
              Shopping Bag
            </span>
            <span className="text-[11px] uppercase tracking-widest text-neutral-400">
              ({items.length} {items.length === 1 ? "Piece" : "Pieces"})
            </span>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setCheckoutComplete(false);
            }}
            className="p-1 text-neutral-400 hover:text-black transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content Body */}
        {checkoutComplete ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mb-6">
              <ShieldCheck size={32} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl tracking-[0.15em] uppercase mb-2">
              Order Received
            </h3>
            <p className="text-[12px] uppercase tracking-[0.2em] text-neutral-500 mb-6">
              Reference: {orderRef}
            </p>
            <p className="text-[13px] text-neutral-600 leading-relaxed font-light mb-8 max-w-xs">
              Thank you for acquiring from Mozart. Our concierge team is preparing your signature parcel at our Paris atelier.
            </p>
            <button
              onClick={() => {
                setCheckoutComplete(false);
                setIsCartOpen(false);
              }}
              className="bg-black text-white text-[11px] tracking-[0.25em] uppercase py-3.5 px-8 font-medium hover:bg-neutral-800 transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span className="font-serif text-3xl tracking-[0.2em] uppercase text-neutral-300 mb-4">
              Bag Is Empty
            </span>
            <p className="text-[12px] tracking-[0.15em] uppercase text-neutral-400 max-w-xs mb-8">
              Explore our new seasonal creations for Men and Women.
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="border border-black text-black text-[11px] tracking-[0.25em] uppercase py-3 px-8 font-medium hover:bg-black hover:text-white transition-all"
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-8 py-6 divide-y divide-black/[0.06]">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}`} className="py-5 flex space-x-4">
                {/* Thumbnail */}
                <div className="w-20 h-24 bg-[#edeae4] overflow-hidden shrink-0 aspect-[3/4]">
                  <img
                    src={item.product.image_url}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="text-[12px] tracking-[0.12em] uppercase font-medium text-neutral-900 line-clamp-1">
                        {item.product.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-neutral-400 hover:text-red-600 transition-colors ml-2"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px] tracking-widest uppercase text-neutral-500 mt-1">
                      <span>Size: {item.selectedSize || "M"}</span>
                      <span>•</span>
                      <span>{item.product.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-neutral-300">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                        className="px-2 py-1 text-neutral-600 hover:text-black hover:bg-neutral-100"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="px-3 text-[11px] font-sans font-medium text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                        className="px-2 py-1 text-neutral-600 hover:text-black hover:bg-neutral-100"
                      >
                        <Plus size={10} />
                      </button>
                    </div>

                    <span className="text-[12px] font-sans tracking-wide text-neutral-900 font-medium">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer actions */}
        {items.length > 0 && !checkoutComplete && (
          <div className="p-8 border-t border-black/[0.07] bg-[#f5f4ef]/60">
            <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.18em] font-medium text-neutral-800 mb-2">
              <span>Estimated Subtotal</span>
              <span className="font-sans font-semibold text-base">{formattedSubtotal}</span>
            </div>
            <p className="text-[10px] tracking-[0.1em] text-neutral-500 font-light mb-6 flex items-center space-x-1">
              <span>✓ Complimentary insured express delivery & atelier wrapping</span>
            </p>

            <button
              onClick={handleCheckout}
              className="w-full bg-[#09090b] hover:bg-black text-white text-[11px] tracking-[0.25em] uppercase font-semibold py-4 flex items-center justify-center space-x-3 transition-colors group"
            >
              <span>Proceed To Checkout</span>
              <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
