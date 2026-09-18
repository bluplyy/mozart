"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#09090b] text-[#fafaf8] pt-24 pb-12 border-t border-neutral-900">
      <div className="max-w-[1720px] mx-auto px-8">
        {/* Top Newsletter & Manifesto Row */}
        <div className="grid grid-cols-12 gap-12 pb-20 border-b border-neutral-800">
          <div className="col-span-6 pr-12">
            <h3 className="font-serif text-3xl tracking-[0.2em] uppercase text-white font-normal mb-4">
              Enter The Mozart Atelier
            </h3>
            <p className="text-neutral-400 text-[13px] leading-relaxed max-w-md font-light mb-8">
              Subscribe to receive private salon invitations, preview seasonal lookbooks, and access bespoke haute couture appointments.
            </p>
            {subscribed ? (
              <div className="text-[12px] uppercase tracking-[0.2em] text-neutral-300 py-3 border-b border-neutral-700">
                ✓ Welcome to the Mozart Gazette. Your invitation is pending.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-md border-b border-neutral-600 focus-within:border-white transition-colors">
                <input
                  type="email"
                  placeholder="YOUR EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-transparent text-[11px] tracking-[0.2em] uppercase text-white placeholder:text-neutral-500 py-3 flex-1 outline-none"
                />
                <button
                  type="submit"
                  className="text-[11px] tracking-[0.25em] uppercase text-white hover:text-neutral-300 py-3 font-medium transition-colors"
                >
                  Join
                </button>
              </form>
            )}
          </div>

          <div className="col-span-2">
            <h4 className="text-[11px] tracking-[0.25em] uppercase text-neutral-400 font-semibold mb-6">
              Collections
            </h4>
            <ul className="space-y-3.5 text-[12px] tracking-[0.12em] uppercase text-neutral-300">
              <li>
                <Link href="/men" className="hover:text-white transition-colors">
                  Men's Haute Horlogerie & Attire
                </Link>
              </li>
              <li>
                <Link href="/women" className="hover:text-white transition-colors">
                  Women's Runway & Leather
                </Link>
              </li>
              <li>
                <Link href="/#split-showcase" className="hover:text-white transition-colors">
                  Permanent Archive
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2">
            <h4 className="text-[11px] tracking-[0.25em] uppercase text-neutral-400 font-semibold mb-6">
              Client Care
            </h4>
            <ul className="space-y-3.5 text-[12px] tracking-[0.12em] uppercase text-neutral-300">
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Bespoke Atelier Appointments
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Garment Preservation & Care
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Complimentary Worldwide Courier
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Authenticity Certificates
                </span>
              </li>
            </ul>
          </div>

          <div className="col-span-2">
            <h4 className="text-[11px] tracking-[0.25em] uppercase text-neutral-400 font-semibold mb-6">
              Boutiques
            </h4>
            <ul className="space-y-2 text-[12px] tracking-[0.1em] text-neutral-400 font-light">
              <li>
                <span className="text-white block font-normal">Paris Flagship</span>
                12 Place Vendôme, 75001
              </li>
              <li className="pt-2">
                <span className="text-white block font-normal">Milan Salone</span>
                Via Montenapoleone 8, 20121
              </li>
              <li className="pt-2">
                <span className="text-white block font-normal">Tokyo Ginza</span>
                6-10-1 Ginza, Chuo City
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-10 flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-neutral-500">
          <div className="font-serif tracking-[0.35em] text-neutral-300 text-lg">
            MOZART
          </div>
          <div>
            © {new Date().getFullYear()} MOZART HAUTE COUTURE. ALL RIGHTS RESERVED.
          </div>
          <div className="flex space-x-6">
            <span className="hover:text-neutral-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-neutral-300 cursor-pointer">Provenance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
