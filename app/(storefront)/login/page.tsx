"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Mail } from "lucide-react";

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

  return (
    <div className="min-h-[85vh] flex items-center justify-center max-w-[1720px] mx-auto px-8 py-16">
      <div className="max-w-md mx-auto w-full py-8">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl tracking-[0.15em] uppercase text-neutral-900 font-normal">
            SIGN IN
          </h1>
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
            <span>{loading ? "Authenticating..." : "ENTER"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Link to Sign Up */}
        <div className="mt-8 text-center text-[12px] tracking-wide text-neutral-500">
          Not yet registered with Mozart?{" "}
          <Link
            href="/signup"
            className="text-neutral-900 font-semibold uppercase tracking-wider underline underline-offset-4 hover:text-neutral-600"
          >
            SIGN UP
          </Link>
        </div>
      </div>
    </div>
  );
}
