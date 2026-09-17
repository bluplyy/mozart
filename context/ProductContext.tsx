"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Product } from "@/lib/types";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProductsToSupabase,
  getSupabaseCredentials,
} from "@/lib/supabaseClient";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  isUsingSupabase: boolean;
  supabaseError: string | null;
  supabaseConfig: { url: string; key: string };
  saveCredentials: (url: string, key: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<{ success: boolean; error?: string }>;
  editProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  removeProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  seedSampleData: () => Promise<{ success: boolean; count?: number; error?: string }>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [supabaseConfig, setSupabaseConfig] = useState({ url: "", key: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const creds = getSupabaseCredentials();
      setSupabaseConfig(creds);

      const res = await fetchProducts();
      setProducts(res.products);
      setIsUsingSupabase(res.isSupabase);
      setSupabaseError(res.error || null);
    } catch (err: any) {
      console.error("Error loading products:", err);
      setSupabaseError(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveCredentials = async (url: string, key: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mozart_supabase_url", url.trim());
      localStorage.setItem("mozart_supabase_key", key.trim());
      setSupabaseConfig({ url: url.trim(), key: key.trim() });
    }
    await loadData();
  };

  const addProduct = async (newProd: Omit<Product, "id">) => {
    const res = await createProduct(newProd);
    if (res.success && res.product) {
      setProducts((prev) => [res.product!, ...prev]);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const editProduct = async (id: string, updates: Partial<Product>) => {
    const res = await updateProduct(id, updates);
    if (res.success && res.product) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? res.product! : p))
      );
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const removeProduct = async (id: string) => {
    const res = await deleteProduct(id);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const seedSampleData = async () => {
    const res = await seedProductsToSupabase();
    if (res.count > 0) {
      await loadData();
      return { success: true, count: res.count };
    }
    return { success: false, error: res.error };
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        isUsingSupabase,
        supabaseError,
        supabaseConfig,
        saveCredentials,
        refreshProducts: loadData,
        addProduct,
        editProduct,
        removeProduct,
        seedSampleData,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
