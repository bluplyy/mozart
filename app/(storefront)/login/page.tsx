"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";

export default function CustomerLoginPage() {
  const { signIn, isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated && user?.role === "customer") {
    router.push("/account");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn(email, password, "customer");
      if (res.success) {
        router.push("/account");
      } else {
        setError(res.error || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("client@mozart.com");
    setPassword("password123");
  };

  return (
    <div className="min-h-[85vh] grid grid-cols-12 max-w-[1720px] mx-auto px-8 py-12 gap-12 items-center">
      {/* Left Column: High-Fashion Editorial Imagery (5 cols) */}
      <div className="col-span-5 relative h-[720px] bg-black overflow-hidden shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
          alt="Mozart Salon"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10 text-white">
          <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-400 block mb-2">
            Client Privilege
          </span>
          <h3 className="font-serif text-3xl tracking-[0.1em] uppercase font-normal mb-3">
            Private Salon Access
          </h3>
          <p className="text-[12px] text-neutral-300 font-light leading-relaxed tracking-wide">
            Sign in to access your bespoke orders, preview private runway collections, and communicate with your dedicated Paris concierge.
          </p>
        </div>
      </div>

      {/* Right Column: Editorial Login Form (7 cols) */}
      <div className="col-span-7 max-w-lg mx-auto w-full py-8">
        <div className="mb-10 text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-semibold block mb-2">
            Haute Couture Authentication
          </span>
          <h1 className="font-serif text-4xl tracking-[0.15em] uppercase text-neutral-900 font-normal">
            Client Sign In
          </h1>
          <p className="text-[12px] text-neutral-500 font-light tracking-wide mt-2">
            Enter your email and credentials to enter the Mozart Salon.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-800 text-[12px] text-red-900 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-semibold mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@domain.com"
                className="w-full bg-white border border-neutral-300 px-4 py-3 text-[13px] tracking-wider text-neutral-900 focus:border-black outline-none font-sans"
              />
              <Mail size={15} className="absolute right-4 top-3.5 text-neutral-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-semibold">
                Password
              </label>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 hover:text-black cursor-pointer">
                Forgot Code?
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-neutral-300 px-4 py-3 text-[13px] tracking-wider text-neutral-900 focus:border-black outline-none font-sans pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-neutral-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#09090b] hover:bg-black text-white text-[11px] tracking-[0.25em] uppercase font-semibold py-4 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Enter Client Salon"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Demo Quick Fill Helper */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] text-center">
          <button
            type="button"
            onClick={handleDemoFill}
            className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 hover:text-black border border-neutral-300 hover:border-black py-2 px-4 inline-flex items-center gap-1.5 transition-colors"
          >
            <Sparkles size={12} />
            <span>Use Demo Client Account (`client@mozart.com`)</span>
          </button>
        </div>

        {/* Link to Sign Up */}
        <div className="mt-8 text-center text-[12px] tracking-wide text-neutral-500">
          Not yet registered with Mozart?{" "}
          <Link
            href="/signup"
            className="text-neutral-900 font-semibold uppercase tracking-wider underline underline-offset-4 hover:text-neutral-600"
          >
            Join The Atelier
          </Link>
        </div>
      </div>
    </div>
  );
}
