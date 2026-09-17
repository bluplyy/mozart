"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Package,
  MapPin,
  LogOut,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function CustomerAccountPage() {
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !user) {
    return (
      <div className="max-w-[1720px] mx-auto px-8 py-32 text-center">
        <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">
          Loading Client Dossier...
        </span>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="max-w-[1720px] mx-auto px-8 py-16">
      {/* Top Header */}
      <div className="border-b border-black/[0.08] pb-8 mb-12 flex items-end justify-between">
        <div>
          <div className="flex items-center space-x-2 text-[10px] tracking-[0.25em] uppercase text-neutral-400 mb-3">
            <Link href="/" className="hover:text-black">
              Atelier
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">Client Dossier</span>
          </div>

          <h1 className="font-serif text-5xl tracking-[0.08em] uppercase font-normal text-neutral-900">
            Welcome, {user.name}
          </h1>
          <p className="text-neutral-500 text-[13px] font-light tracking-wide mt-2">
            Mozart Haute Couture Private Salon • Member ID: {user.id.toUpperCase()}
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="border border-neutral-300 hover:border-black text-[11px] tracking-[0.2em] uppercase font-medium py-3 px-6 text-neutral-700 hover:text-black flex items-center space-x-2 transition-colors"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-12">
        {/* Left Column: Membership & Concierge Details (4 cols) */}
        <div className="col-span-4 space-y-8">
          {/* Membership Card */}
          <div className="bg-[#09090b] text-[#fafaf8] p-8 relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block mb-1 font-mono">
                TIER STATUS
              </span>
              <h3 className="font-serif text-2xl tracking-[0.15em] uppercase mb-4 text-white">
                Private Salon Patron
              </h3>
              <p className="text-[12px] text-neutral-400 font-light leading-relaxed mb-6">
                Direct salon privilege with complimentary bespoke fittings in Paris and Milan ateliers.
              </p>

              <div className="border-t border-neutral-800 pt-4 flex items-center justify-between text-[11px] text-neutral-300">
                <span className="uppercase tracking-widest font-mono">Concierge: Active</span>
                <Sparkles size={14} className="text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-[#fafaf8] border border-neutral-200 p-8 space-y-6">
            <h4 className="font-serif text-lg tracking-[0.15em] uppercase text-neutral-900 border-b border-black/[0.06] pb-3">
              Patron Profile
            </h4>

            <div className="space-y-4 text-[13px]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block font-semibold">
                  Full Name
                </span>
                <span className="text-neutral-900 font-medium">{user.name}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block font-semibold">
                  Registered Email
                </span>
                <span className="text-neutral-900 font-mono text-[12px]">{user.email}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block font-semibold">
                  Primary Delivery Residence
                </span>
                <span className="text-neutral-900">
                  12 Place Vendôme, 1er Arrondissement, Paris, France
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Atelier Orders & Acquisitions (8 cols) */}
        <div className="col-span-8 space-y-8">
          <div className="bg-[#fafaf8] border border-neutral-200 p-8">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <Package size={18} className="text-neutral-700" />
                <h3 className="font-serif text-2xl tracking-[0.1em] uppercase text-neutral-900 font-normal">
                  Atelier Acquisition History
                </h3>
              </div>
              <span className="text-[11px] uppercase tracking-widest text-neutral-400">
                2 Archived Orders
              </span>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
              {/* Order 1 */}
              <div className="border border-neutral-200 p-6 bg-white flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-20 bg-[#edeae4] overflow-hidden aspect-[3/4]">
                    <img
                      src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&auto=format&fit=crop"
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-mono block">
                      REF: MZT-849102 • 14 SEP 2026
                    </span>
                    <h4 className="text-[13px] tracking-wider uppercase font-medium text-neutral-900 mt-1">
                      Double-Breasted Cashmere Overcoat
                    </h4>
                    <span className="text-[11px] text-neutral-500 font-light mt-0.5 block">
                      Size: 48 EU • Status: Atelier Hand-Finished & Dispatched via DHL Express
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-sans font-medium text-neutral-900 text-sm block">
                    $3,450 USD
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 mt-1 inline-block font-semibold">
                    In Transit
                  </span>
                </div>
              </div>

              {/* Order 2 */}
              <div className="border border-neutral-200 p-6 bg-white flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-20 bg-[#edeae4] overflow-hidden aspect-[3/4]">
                    <img
                      src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop"
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-mono block">
                      REF: MZT-712849 • 28 AUG 2026
                    </span>
                    <h4 className="text-[13px] tracking-wider uppercase font-medium text-neutral-900 mt-1">
                      The Mozart Monogram Grand Sac
                    </h4>
                    <span className="text-[11px] text-neutral-500 font-light mt-0.5 block">
                      One Size • Status: Delivered to Paris Salon
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-sans font-medium text-neutral-900 text-sm block">
                    $4,200 USD
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-600 bg-neutral-100 px-2.5 py-0.5 mt-1 inline-block font-semibold">
                    Delivered
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Browse Banner */}
          <div className="bg-[#f4f3ee] p-8 border border-neutral-200 flex items-center justify-between">
            <div>
              <h4 className="font-serif text-xl tracking-wider uppercase text-neutral-900">
                Explore The Latest Runway Drops
              </h4>
              <p className="text-[12px] text-neutral-500 font-light mt-1">
                New architectural silhouettes available in Men's and Women's archives.
              </p>
            </div>

            <div className="flex space-x-4">
              <Link
                href="/men"
                className="bg-black text-white text-[10px] tracking-[0.2em] uppercase font-semibold py-3 px-6 hover:bg-neutral-800 transition-colors"
              >
                Men's Collection
              </Link>
              <Link
                href="/women"
                className="border border-black text-black text-[10px] tracking-[0.2em] uppercase font-semibold py-3 px-6 hover:bg-black hover:text-white transition-all"
              >
                Women's Collection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
