"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Package, LogOut } from "lucide-react";

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
              Home
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">Client Profile</span>
          </div>

          <h1 className="font-serif text-5xl tracking-[0.08em] uppercase font-normal text-neutral-900">
            Welcome, {user.name}
          </h1>
          <p className="text-neutral-500 text-[13px] font-light tracking-wide mt-2">
            Mozart Private Studio • Member ID: {user.id.toUpperCase()}
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

      {/* Order History */}
      <div className="bg-[#fafaf8] border border-neutral-200 p-8">
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <Package size={18} className="text-neutral-700" />
            <h3 className="font-serif text-2xl tracking-[0.1em] uppercase text-neutral-900 font-normal">
              Order History
            </h3>
          </div>
          <span className="text-[11px] uppercase tracking-widest text-neutral-400">
            0 Orders
          </span>
        </div>

        <div className="py-16 text-center">
          <p className="text-neutral-400 text-[12px] uppercase tracking-[0.2em] font-light">
            No orders placed yet.
          </p>
          <Link
            href="/#split-showcase"
            className="inline-block mt-4 text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
          >
            Discover Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
