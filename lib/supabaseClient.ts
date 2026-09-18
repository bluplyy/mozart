import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Product } from "./types";
import { INITIAL_PRODUCTS } from "./initial-products";

const DEFAULT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kafchlvjbbauchwuehyt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_UHYTDNAXio72kHONE0KUKw_9R_O-pWK";

// Cache local products for fallback
const LOCAL_STORAGE_KEY = "mozart_local_products_v1";

export function getSupabaseCredentials() {
  if (typeof window !== "undefined") {
    const customKey = localStorage.getItem("mozart_supabase_key");
    const customUrl = localStorage.getItem("mozart_supabase_url");
    return {
      url: customUrl || DEFAULT_SUPABASE_URL,
      key: customKey || DEFAULT_SUPABASE_ANON_KEY,
    };
  }
  return {
    url: DEFAULT_SUPABASE_URL,
    key: DEFAULT_SUPABASE_ANON_KEY,
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;
  try {
    return createClient(url, key, {
      auth: { persistSession: false },
    });
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
    return null;
  }
}

// Local storage fallback helpers
function getLocalFallback(): Product[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  } catch (e) {
    // ignore quota errors
  }
  return INITIAL_PRODUCTS;
}

function saveLocalFallback(products: Product[]) {
  if (typeof window === "undefined") return;
  try {
    // Sanitize any huge base64 strings so localStorage quota is never exceeded
    const safeProducts = products.map((p) => ({
      ...p,
      image_url: p.image_url?.startsWith("data:") ? "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop" : p.image_url,
      secondary_image_url: p.secondary_image_url?.startsWith("data:") ? undefined : p.secondary_image_url,
      images: p.images ? p.images.map((img) => img.startsWith("data:") ? "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop" : img) : undefined,
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(safeProducts));
  } catch (e) {
    console.warn("localStorage quota exceeded or write failed, skipping local storage sync:", e);
  }
}

// High-level API operations
export async function fetchProducts(): Promise<{ products: Product[]; isSupabase: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return { products: data as Product[], isSupabase: true };
      }

      if (error) {
        console.warn("Supabase query warning/error:", error.message);
        return {
          products: getLocalFallback(),
          isSupabase: false,
          error: error.message,
        };
      }

      // If empty array in Supabase table
      return { products: [], isSupabase: true };
    } catch (err: any) {
      console.error("Supabase fetch exception:", err);
      return {
        products: getLocalFallback(),
        isSupabase: false,
        error: err?.message || "Connection failed",
      };
    }
  }

  return { products: getLocalFallback(), isSupabase: false };
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) return data as Product;
    } catch {
      // Fallback below
    }
  }

  const locals = getLocalFallback();
  return locals.find((p) => p.id === id) || null;
}

export async function createProduct(newProduct: Omit<Product, "id"> & { id?: string }): Promise<{ success: boolean; product?: Product; error?: string }> {
  const supabase = getSupabaseClient();
  const id = newProduct.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `mzt-${Date.now()}`);
  const productToSave: Product = {
    ...newProduct,
    id,
    images: newProduct.images || (newProduct.image_url ? [newProduct.image_url, ...(newProduct.secondary_image_url ? [newProduct.secondary_image_url] : [])] : []),
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([productToSave])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        // Fallback to local
        const current = getLocalFallback();
        saveLocalFallback([productToSave, ...current]);
        return { success: true, product: productToSave, error: `Saved locally (Supabase: ${error.message})` };
      }

      return { success: true, product: (data as Product) || productToSave };
    } catch (err: any) {
      console.error("Supabase insert exception:", err);
    }
  }

  // Fallback to local
  const current = getLocalFallback();
  saveLocalFallback([productToSave, ...current]);
  return { success: true, product: productToSave };
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; product?: Product; error?: string }> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error);
      } else if (data) {
        return { success: true, product: data as Product };
      }
    } catch (err: any) {
      console.error("Supabase update exception:", err);
    }
  }

  // Update in local fallback
  const current = getLocalFallback();
  const index = current.findIndex((p) => p.id === id);
  if (index !== -1) {
    current[index] = { ...current[index], ...updates };
    saveLocalFallback(current);
    return { success: true, product: current[index] };
  }

  return { success: false, error: "Product not found" };
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        console.error("Supabase delete error:", error);
      }
    } catch (err: any) {
      console.error("Supabase delete exception:", err);
    }
  }

  // Remove from local fallback
  const current = getLocalFallback();
  const filtered = current.filter((p) => p.id !== id);
  saveLocalFallback(filtered);
  return { success: true };
}

export async function seedProductsToSupabase(): Promise<{ count: number; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { count: 0, error: "Supabase client not configured (Missing Anon Key)" };
  }

  try {
    const { error } = await supabase.from("products").upsert(INITIAL_PRODUCTS, { onConflict: "id" });
    if (error) {
      return { count: 0, error: error.message };
    }
    return { count: INITIAL_PRODUCTS.length };
  } catch (err: any) {
    return { count: 0, error: err?.message || "Failed to seed" };
  }
}
