"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const { signIn, isAuthenticated, role } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated && role === "admin") {
    router.push("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn(email, password, "admin");
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.error || "Access denied. Invalid curator credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCurator = async () => {
    setEmail("admin@mozart.com");
    setPassword("atelier2026");
    setLoading(true);
    try {
      const res = await signIn("admin@mozart.com", "atelier2026", "admin");
      if (res.success) {
        router.push("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between p-8 font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center space-x-2 text-[11px] tracking-[0.2em] uppercase text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          <span>Return To Storefront</span>
        </Link>
        <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 font-mono">
          ATELIER CURATION SYSTEM
        </span>
      </div>

      {/* Main Login Box */}
      <div className="max-w-md w-full mx-auto my-12 bg-neutral-900/90 border border-neutral-800 p-10 shadow-2xl backdrop-blur-sm">
        {/* Studio Emblem */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full border border-neutral-700 bg-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-300">
            <ShieldCheck size={22} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-3xl tracking-[0.25em] uppercase text-white font-normal">
            MOZART
          </h2>
          <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 block mt-1">
            Studio / Admin Portal
          </span>
          <p className="text-[12px] text-neutral-400 font-light mt-3 tracking-wide">
            Restricted access. Dedicated to archive curators, inventory directors, and maison administrators.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/60 border-l-2 border-red-500 text-[12px] text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-semibold mb-2">
              Curator Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mozart.com"
                className="w-full bg-neutral-950 border border-neutral-700 px-4 py-3 text-[13px] tracking-wider text-white focus:border-white outline-none font-mono"
              />
              <Mail size={15} className="absolute right-4 top-3.5 text-neutral-500" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-semibold mb-2">
              Master Passkey
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-neutral-950 border border-neutral-700 px-4 py-3 text-[13px] tracking-wider text-white focus:border-white outline-none font-mono"
              />
              <Lock size={15} className="absolute right-4 top-3.5 text-neutral-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-neutral-200 text-[11px] tracking-[0.25em] uppercase font-semibold py-4 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <span>{loading ? "Verifying Access..." : "Unlock Studio Dashboard"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* 1-Click Demo Curator Access */}
        <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
          <button
            type="button"
            onClick={handleDemoCurator}
            disabled={loading}
            className="w-full border border-neutral-700 hover:border-neutral-500 text-[11px] tracking-[0.2em] uppercase text-neutral-300 py-3 px-4 flex items-center justify-center space-x-2 transition-all hover:bg-neutral-800"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>1-Click Demo Curator Login</span>
          </button>
          <span className="text-[10px] text-neutral-500 mt-2 block font-mono">
            Default: admin@mozart.com / atelier2026
          </span>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-[10px] tracking-[0.25em] uppercase text-neutral-600">
        MOZART MAISON DIGITAL INFRASTRUCTURE • ALL SESSIONS MONITORED
      </div>
    </div>
  );
}
