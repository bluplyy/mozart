"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Eye, LogOut, ShieldCheck, User } from "lucide-react";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, role, loading, signOut } = useAuth();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !isLoginPage) {
      if (!isAuthenticated || role !== "admin") {
        router.push("/admin/login");
      }
    }
  }, [isAuthenticated, role, loading, isLoginPage, router]);

  // If on login page, render clean page without admin topbar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If loading or unauthenticated, show loading barrier
  if (loading || !isAuthenticated || role !== "admin") {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white font-sans p-8">
        <div className="w-12 h-12 rounded-full border border-neutral-700 bg-neutral-900 flex items-center justify-center mb-4 animate-pulse">
          <ShieldCheck size={24} className="text-neutral-400" />
        </div>
        <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">
          Verifying Curator Clearance...
        </span>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0] flex flex-col font-sans">
      {/* Admin Top Navigation */}
      <header className="bg-[#09090b] text-white border-b border-neutral-800 sticky top-0 z-30">
        <div className="max-w-[1720px] mx-auto px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/admin" className="flex items-center space-x-3">
              <span className="font-serif text-2xl tracking-[0.3em] uppercase text-white font-normal">
                MOZART
              </span>
              <span className="bg-neutral-800 text-[10px] tracking-[0.25em] uppercase text-neutral-300 px-2.5 py-1 font-mono">
                Studio / Admin
              </span>
            </Link>

            <div className="h-4 w-[1px] bg-neutral-800" />

            <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">
              Desktop Curation Suite
            </span>
          </div>

          <div className="flex items-center space-x-5">
            {/* Active Curator Badge */}
            <div className="flex items-center space-x-2 text-[11px] uppercase tracking-wider text-neutral-300 bg-neutral-900 border border-neutral-800 py-1.5 px-3">
              <User size={12} className="text-amber-400" />
              <span>{user?.name || "Curator"}</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="border border-neutral-700 hover:border-white text-[11px] tracking-[0.2em] uppercase text-neutral-300 hover:text-white px-4 py-2 flex items-center space-x-2 transition-colors"
            >
              <Eye size={13} />
              <span>Preview Live Store</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="border border-neutral-700 hover:border-red-500 text-[11px] tracking-[0.2em] uppercase text-neutral-400 hover:text-red-400 px-3.5 py-2 flex items-center space-x-1.5 transition-colors"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-8 py-10">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-neutral-300 py-6 text-center text-[10px] tracking-[0.2em] uppercase text-neutral-500">
        MOZART PARIS • BACKOFFICE CURATION SYSTEM • AUTHENTICATED SESSION
      </footer>
    </div>
  );
}
