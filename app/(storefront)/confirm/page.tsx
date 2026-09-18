"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Check, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirmAccount, user } = useAuth();

  const token = searchParams.get("token") || searchParams.get("code") || "";
  const email = searchParams.get("email") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedName, setConfirmedName] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      if (!token && !email) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage("Invalid confirmation link. Missing security token.");
        }
        return;
      }

      try {
        const result = await confirmAccount(token, email);
        if (isMounted) {
          if (result.success) {
            setStatus("success");
            setConfirmedName(result.user?.name || user?.name || "Valued Patron");
            // Auto-redirect to account after 3 seconds
            setTimeout(() => {
              router.push("/account");
            }, 3000);
          } else {
            setStatus("error");
            setErrorMessage(result.error || "Confirmation link is invalid or has expired.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(err?.message || "An unexpected error occurred during confirmation.");
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token, email, confirmAccount, router, user]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center max-w-[1720px] mx-auto px-8 py-20">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <div className="py-12 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 animate-pulse">
              <Loader2 size={24} className="animate-spin" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-semibold block mb-2 font-mono">
                AUTHENTICATING PROFILE
              </span>
              <h1 className="font-serif text-3xl tracking-[0.1em] uppercase text-neutral-900 font-normal">
                Verifying Confirmation
              </h1>
              <p className="text-[12px] text-neutral-500 font-light mt-2">
                Validating your secure email authorization token...
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="py-10 space-y-6 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-black text-white flex items-center justify-center shadow-lg">
              <Check size={24} strokeWidth={2} />
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-semibold block mb-2 font-mono">
                MEMBERSHIP ACTIVATED
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl tracking-[0.1em] uppercase text-neutral-900 font-normal">
                Account Confirmed
              </h1>
              <p className="text-[13px] text-neutral-600 font-light leading-relaxed max-w-sm mx-auto mt-3">
                Welcome to the Mozart Private Studio{confirmedName ? `, ${confirmedName}` : ""}. Your patron account is now verified and active.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Link
                href="/account"
                className="w-full bg-[#09090b] hover:bg-black text-white text-[11px] tracking-[0.25em] uppercase font-semibold py-4 flex items-center justify-center space-x-2 transition-colors shadow-sm"
              >
                <span>Enter Client Profile</span>
                <ArrowRight size={14} />
              </Link>
              <p className="text-[11px] text-neutral-400 font-mono">
                Redirecting automatically to your profile in 3 seconds...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-10 space-y-6 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-700 flex items-center justify-center border border-red-100">
              <AlertCircle size={24} strokeWidth={1.5} />
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-red-600 font-semibold block mb-2 font-mono">
                VERIFICATION NOTICE
              </span>
              <h1 className="font-serif text-3xl tracking-[0.1em] uppercase text-neutral-900 font-normal">
                Confirmation Failed
              </h1>
              <p className="text-[13px] text-neutral-600 font-light leading-relaxed max-w-sm mx-auto mt-3">
                {errorMessage}
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Link
                href="/signup"
                className="w-full bg-[#09090b] hover:bg-black text-white text-[11px] tracking-[0.25em] uppercase font-semibold py-4 transition-colors"
              >
                Return To Registration
              </Link>
              <Link
                href="/login"
                className="w-full border border-neutral-300 hover:border-black text-neutral-800 text-[11px] tracking-[0.2em] uppercase font-semibold py-3 transition-colors"
              >
                Try Client Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center max-w-[1720px] mx-auto px-8 py-20">
          <div className="text-center text-neutral-400 text-[11px] uppercase tracking-widest font-mono">
            Loading Confirmation...
          </div>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
