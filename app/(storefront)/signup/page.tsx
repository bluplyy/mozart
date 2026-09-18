"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OtpInput from "@/components/ui/OtpInput";
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function CustomerSignUpPage() {
  const {
    initiateSignUpWithOtp,
    verifySignUpOtp,
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

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (isAuthenticated) {
    router.push("/account");
    return null;
  }

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
        setDispatchedOtp(res.otp || null);
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

  // Step 2: Verify OTP
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await verifySignUpOtp(email, otpCode);
      if (res.success) {
        router.push("/account");
      } else {
        setError(res.error || "Invalid verification code.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    setError(null);
    setLoading(true);
    try {
      const res = await resendSignUpOtp(email);
      if (res.success) {
        setDispatchedOtp(res.otp || null);
        setCountdown(60);
        setCanResend(false);
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        setError(res.error || "Failed to resend verification code.");
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
                  I agree to the <span className="underline">Mozart Studio Terms</span> and acknowledge that a 6-digit confirmation code will be dispatched to my email.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#09090b] hover:bg-black text-white text-[11px] tracking-[0.25em] uppercase font-semibold py-4 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <span>{loading ? "Generating Verification Code..." : "Continue To Verification"}</span>
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
          /* STEP 2: 6-DIGIT EMAIL CODE VERIFICATION */
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

            <div className="mb-8 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto mb-4">
                <Mail size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-semibold block mb-2 font-mono">
                Email Authentication Required
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl tracking-[0.1em] uppercase text-neutral-900 font-normal">
                Enter Verification Code
              </h1>
              <p className="text-[12px] text-neutral-600 font-light tracking-wide mt-2">
                We have dispatched a 6-digit confidential code to:
              </p>
              <span className="text-[13px] font-mono font-medium text-neutral-900 block mt-1">
                {email}
              </span>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-800 text-[12px] text-red-900 font-medium">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="mb-6 p-3 bg-emerald-50 border-l-2 border-emerald-600 text-[12px] text-emerald-900 flex items-center space-x-2">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>A new verification code has been dispatched.</span>
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-8">
              {/* 6-Digit Box Input Component */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-semibold mb-3 text-center">
                  Enter 6-Digit Studio Code
                </label>
                <OtpInput
                  value={otpCode}
                  onChange={setOtpCode}
                  disabled={loading}
                />
              </div>

              {/* Instructions to check email app like Gmail */}
              <div className="p-5 bg-white border border-neutral-200 shadow-sm space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-100">
                    <Mail size={17} />
                  </div>
                  <div className="text-[12px] text-neutral-600 leading-relaxed font-light">
                    <p className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px] mb-1">
                      Check Your Gmail or Email Application
                    </p>
                    <p>
                      Your 6-digit confidential studio verification code has been dispatched to{" "}
                      <strong className="font-mono text-neutral-900 font-semibold">{email}</strong>.
                      Please open your email application to retrieve your code.
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons to Open Gmail or Webmail Client */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-neutral-300 hover:border-black text-neutral-800 text-[10px] tracking-[0.15em] uppercase font-semibold py-3 px-3 flex items-center justify-center space-x-1.5 transition-colors bg-neutral-50 hover:bg-white"
                  >
                    <span>Open Real Gmail</span>
                    <ExternalLink size={12} />
                  </a>

                  <Link
                    href="/gmail"
                    target="_blank"
                    className="bg-[#09090b] hover:bg-black text-white text-[10px] tracking-[0.15em] uppercase font-semibold py-3 px-3 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>Open Webmail Inbox</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>

              {/* Submit Verification */}
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-[#09090b] hover:bg-black text-white text-[11px] tracking-[0.25em] uppercase font-semibold py-4 flex items-center justify-center space-x-2 transition-colors disabled:opacity-40"
              >
                <span>{loading ? "Verifying Code..." : "Complete Patron Verification"}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Resend Code Section */}
            <div className="mt-8 pt-6 border-t border-black/[0.06] text-center text-[12px] text-neutral-500">
              Didn't receive the email dispatch?{" "}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-neutral-900 font-semibold uppercase tracking-wider underline underline-offset-4 hover:text-neutral-600 ml-1 inline-flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Resend Code</span>
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
