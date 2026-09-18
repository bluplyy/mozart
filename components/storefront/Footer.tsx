import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#09090b] text-[#fafaf8] pt-16 pb-12 border-t border-neutral-900">
      <div className="max-w-[1720px] mx-auto px-8">
        {/* Navigation & Information Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 pb-16 border-b border-neutral-800">
          <div>
            <h4 className="text-[11px] tracking-[0.25em] uppercase text-neutral-400 font-semibold mb-6">
              Collections
            </h4>
            <ul className="space-y-3.5 text-[12px] tracking-[0.12em] uppercase text-neutral-300">
              <li>
                <Link href="/men" className="hover:text-white transition-colors">
                  Men's Fine Timepieces & Attire
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

          <div>
            <h4 className="text-[11px] tracking-[0.25em] uppercase text-neutral-400 font-semibold mb-6">
              Client Care
            </h4>
            <ul className="space-y-3.5 text-[12px] tracking-[0.12em] uppercase text-neutral-300">
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Bespoke Studio Appointments
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

          <div>
            <h4 className="text-[11px] tracking-[0.25em] uppercase text-neutral-400 font-semibold mb-6">
              Boutiques
            </h4>
            <ul className="space-y-2 text-[12px] tracking-[0.1em] text-neutral-400 font-light">
              <li>
                <span className="text-white block font-normal">Paris Flagship</span>
                12 Vendome Square, 75001 Paris
              </li>
              <li className="pt-2">
                <span className="text-white block font-normal">Milan Showroom</span>
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
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] tracking-[0.2em] uppercase text-neutral-500">
          <div className="font-serif tracking-[0.35em] text-neutral-300 text-lg">
            MOZART
          </div>
          <div>
            © {new Date().getFullYear()} MOZART HIGH FASHION. ALL RIGHTS RESERVED.
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
