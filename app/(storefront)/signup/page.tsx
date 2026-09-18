"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function CustomerSignUpPage() {
  const {
    initiateSignUpWithOtp,
    resendSignUpOtp,
    isAuthenticated,
  } = useAuth();
  const router = useRouter();

  // Step state: 'form' | 'verify'
  const [step, setStep] = useState<"form" | "verify">("form");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  // Verification state
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  // If authenticated (e.g. user clicked confirmation link in another tab), redirect to account
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/account");
    }
  }, [isAuthenticated, router]);

  // Countdown timer for resend
  useEffect(() => {
    let timer: any;
    if (step === "verify" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Poll for background confirmation while waiting on verify screen
  useEffect(() => {
    if (step !== "verify") return;

    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        const session = localStorage.getItem("mozart_auth_session_v1");
        if (session) {
          router.push("/account");
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [step, router]);

  // Step 1: Submit Registration Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError("Please accept the Mozart Studio Terms to proceed.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await initiateSignUpWithOtp(name, email, password, "customer");
      if (res.success) {
        setStep("verify");
        setCountdown(60);
        setCanResend(false);
      } else {
        setError(res.error || "Registration could not be initiated.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend Confirmation Email
  const handleResend = async () => {
    if (!canResend) return;
    setError(null);
    setLoading(true);
    try {
      const res = await resendSignUpOtp(email);
      if (res.success) {
        setCountdown(60);
        setCanResend(false);
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        setError(res.error || "Failed to resend confirmation email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center max-w-[1720px] mx-auto px-8 py-16">
      <div className="max-w-md mx-auto w-full py-6">
        {step === "form" ? (
          /* STEP 1: REGISTRATION FORM */
          <div>
            <div className="mb-8 text-center">
              <h1 className="font-serif text-4xl tracking-[0.15em] uppercase text-neutral-900 font-normal">
                Create Client Profile
              </h1>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-800 text-[12px] text-red-900 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-semibold mb-2">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Julian Vance"
                    className="w-full bg-white border border-neutral-300 px-4 py-3 text-[13px] tracking-wider text-neutral-900 focus:border-black outline-none font-sans"
                  />
                  <User size={15} className="absolute right-4 top-3.5 text-neutral-400" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-semibold mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patron@domain.com"
                    className="w-full bg-white border border-neutral-300 px-4 py-3 text-[13px] tracking-wider text-neutral-900 focus:border-black outline-none font-sans"
                  />
                  <Mail size={15} className="absolute right-4 top-3.5 text-neutral-400" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-semibold mb-2">
                  Password (Min. 6 Characters) *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-neutral-300 px-4 py-3 text-[13px] tracking-wider text-neutral-900 focus:border-black outline-none font-sans"
                  />
                  <Lock size={15} className="absolute right-4 top-3.5 text-neutral-400" />
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start space-x-3 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-none border-neutral-400 text-black focus:ring-0 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-neutral-600 leading-relaxed cursor-pointer font-light">
                  I agree to the <span className="underline">Mozart Studio Terms</span> and request an account confirmation link sent to my email.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#09090b] hover:bg-black text-white text-[11px] tracking-[0.25em] uppercase font-semibold py-4 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <span>{loading ? "Dispatching Activation Link..." : "Create Client Profile"}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            <div className="mt-8 text-center text-[12px] tracking-wide text-neutral-500">
              Already registered with Mozart?{" "}
              <Link
                href="/login"
                className="text-neutral-900 font-semibold uppercase tracking-wider underline underline-offset-4 hover:text-neutral-600"
              >
                Sign In Here
              </Link>
            </div>
          </div>
        ) : (
          /* STEP 2: CONFIRM ACCOUNT VIA EMAIL */
          <div className="animate-fadeIn">
            <button
              onClick={() => {
                setStep("form");
                setError(null);
              }}
              className="flex items-center space-x-1.5 text-[10px] tracking-[0.2em] uppercase text-neutral-500 hover:text-black mb-6 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to Edit Profile</span>
            </button>

            <div className="mb-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#09090b] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
                <Mail size={24} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-semibold block mb-2 font-mono">
                EMAIL CONFIRMATION REQUIRED
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl tracking-[0.1em] uppercase text-neutral-900 font-normal">
                Check Your Email
              </h1>
              <p className="text-[12px] text-neutral-600 font-light tracking-wide mt-2">
                We have dispatched a private account confirmation link to:
              </p>
              <span className="text-[14px] font-mono font-semibold text-neutral-900 block mt-1">
                {email}
              </span>
              <p className="text-[12px] text-neutral-500 font-light mt-3 leading-relaxed">
                Please open your email application and click the <strong>Confirm Account</strong> button to activate your profile.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-800 text-[12px] text-red-900 font-medium">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="mb-6 p-3 bg-emerald-50 border-l-2 border-emerald-600 text-[12px] text-emerald-900 flex items-center space-x-2">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>A new confirmation link has been dispatched to your email.</span>
              </div>
            )}



            {/* Resend Confirmation Link Section */}
            <div className="mt-4 text-center text-[12px] text-neutral-500">
              Didn't receive the email?{" "}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-neutral-900 font-semibold uppercase tracking-wider underline underline-offset-4 hover:text-neutral-600 ml-1 inline-flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Resend Confirmation Link</span>
                </button>
              ) : (
                <span className="text-neutral-400 font-mono text-[11px] ml-1">
                  Resend available in {countdown}s
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
