import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ProductProvider } from "@/context/ProductContext";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/storefront/CartDrawer";

export const metadata: Metadata = {
  title: "MOZART | High Fashion Paris",
  description: "Minimalist luxury fashion house. Discover bespoke tailored collections for Men and Women.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#fafaf8] text-[#09090b]">
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
