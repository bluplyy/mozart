---
name: mozart-fashion-store
description: "Comprehensive operational playbook, technical cheatsheet, and design guidelines for developing, curating, and extending the MOZART Haute Couture Next.js & Supabase web platform."
metadata:
  author: "MOZART Atelier Engineering"
  version: "1.0.0"
  stack: "Next.js 16, React 19, TypeScript, Tailwind CSS v4, Supabase"
---

# MOZART Haute Couture — Developer & Operations Skill Guide

This skill guide provides architectural standards, operational workflows, and technical procedures for maintaining and extending the **MOZART Haute Couture** e-commerce platform.

---

## 1. Core Principles & Non-Negotiable Standards

1. **Luxury Editorial Aesthetics (No Generic E-Commerce)**
   - Always adhere to haute couture design conventions inspired by *Louis Vuitton, Chanel, Gucci, Prada, and The Row*.
   - Never use cartoonish animations, saturated primary colors, or cramped layouts.
   - Maintain generous whitespace (`py-16`, `py-24`, `space-y-32`), razor-sharp alignment, and hairline borders (`rgba(0,0,0,0.08)`).
   - All product photography must strictly follow a **3:4 portrait aspect ratio** (`aspect-[3/4]`) to showcase full-length garment drapes.

2. **Strict Category Discipline**
   - The platform strictly supports **two** categories: `"Men"` and `"Women"`.
   - Never introduce extraneous categories (e.g., Kids, Home, Accessories as top-level) without explicit architectural review.

3. **Desktop-First Optimization**
   - The interface is engineered specifically for desktop screens between **1280px and 1920px**.
   - Maximum content width is locked to `max-w-[1720px]` with `px-8` padding.

4. **Dual-Portal Cohesion & Offline Resilience**
   - Any product created, updated, or de-listed in the **Admin Studio (`/admin`)** must immediately synchronize and reflect on the **Customer Storefront (`/`, `/men`, `/women`, `/product/[id]`)**.
   - The client SDK (`lib/supabaseClient.ts`) uses an **Offline-First Resilience Pattern**: if Supabase credentials are missing or the connection is interrupted, the app gracefully falls back to `localStorage` with zero white screens or unhandled exceptions.

---

## 2. Design System & Token Cheatsheet

### 2.1 Palette Tokens

```css
/* Backgrounds & Canvas */
--bg-primary: #fafaf8;      /* Warm alabaster canvas */
--bg-dark:    #09090b;      /* Obsidian dark surfaces */
--bg-subtle:  #f4f3ee;      /* Table headers & secondary cards */
--bg-frame:   #edeae4;      /* Portrait image placeholder */

/* Borders */
--border-hairline: rgba(0, 0, 0, 0.08);       /* 1px light mode divider */
--border-hairline-dark: rgba(255, 255, 255, 0.12); /* 1px dark mode divider */
```

### 2.2 Typography Classes

| Class | Font Family | Typical Usage | Example |
|---|---|---|---|
| `font-serif` | Italiana / Cormorant | Brandmark, Hero Headline, Section Title | `font-serif text-4xl tracking-[0.15em] uppercase` |
| `font-editorial` | Cormorant Garamond | Quotes, manifesto statements | `font-editorial text-3xl italic` |
| `font-sans` | Plus Jakarta Sans | Body text, form controls, product cards | `text-[13px] tracking-[0.14em] uppercase` |
| `font-mono` | Monospace | Product IDs, SKU references | `text-[10px] tracking-widest font-mono` |

### 2.3 Motion & Interaction Patterns
- **Hover Cross-Fade (Product Cards)**:
  ```tsx
  {/* Primary Image */}
  <img className={`transform transition-all duration-700 ease-out ${
    secondary_image_url && isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
  }`} />
  {/* Secondary Lookbook Image */}
  {secondary_image_url && (
    <img className={`absolute inset-0 transform transition-all duration-700 ease-out ${
      isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
    }`} />
  )}
  ```
- **Micro-Transitions**: Always use cubic-bezier timing: `transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`.

---

## 3. Database Schema & Supabase Operations

### 3.1 DDL SQL Table Definition
When provisioning a new Supabase project or verifying table structures, execute the following in the **Supabase SQL Editor**:

```sql
create table if not exists products (
  id text primary key,
  title text not null,
  category text not null check (category in ('Men', 'Women')),
  price numeric not null,
  image_url text not null,
  secondary_image_url text,
  description text not null,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table products enable row level security;

-- Public policies for Storefront & Admin Demo
create policy "Allow public read" on products for select using (true);
create policy "Allow all insert" on products for insert with check (true);
create policy "Allow all update" on products for update using (true);
create policy "Allow all delete" on products for delete using (true);
```

### 3.2 TypeScript Data Interfaces (`lib/types.ts`)

```typescript
export type Category = "Men" | "Women";

export interface Product {
  id: string;
  title: string;
  category: Category;
  price: number;
  image_url: string;
  secondary_image_url?: string;
  description: string;
  details?: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}
```

### 3.3 Supabase Client SDK (`lib/supabaseClient.ts`)
The client exposes five core asynchronous functions:
- `fetchProducts()`: Returns `{ products: Product[], isSupabase: boolean, error?: string }`.
- `fetchProductById(id)`: Returns `Promise<Product | null>`.
- `createProduct(productData)`: Inserts new piece into Supabase or fallback store.
- `updateProduct(id, updates)`: Updates existing piece by ID.
- `deleteProduct(id)`: Removes piece from archive by ID.
- `seedProductsToSupabase()`: Upserts all starter pieces into the connected Supabase table.

---

## 4. Developer Workflows & Runbook

### 4.1 Running the Application Locally
```bash
# Start Next.js development server (runs with Turbopack)
npm run dev

# Build validation (TypeScript & Static Page checks)
npm run build
```

The application runs on:
- Customer Storefront: `http://localhost:3000`
- Admin Studio: `http://localhost:3000/admin`

### 4.2 Connecting to Supabase
1. **Via Web Interface (Recommended)**:
   - Navigate to `http://localhost:3000/admin`.
   - Click the **"Supabase Connection"** button at the top right.
   - Verify the Supabase URL (`https://kafchlvjbbauchwuehyt.supabase.co`).
   - Paste the `anon` public API key from your Supabase Dashboard (**Project Settings ➔ API ➔ `anon` `public`**).
   - Click **"Save & Connect"**.
   - Click **"Seed Mozart Catalog to Supabase"** to immediately populate the database with 8 curated haute couture pieces.

2. **Via `.env.local` File**:
   Update `e:\Project AI\FashionStore\.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://kafchlvjbbauchwuehyt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

### 4.3 Adding a New Product Programmatically
To add an item via code or seed script:
```typescript
import { createProduct } from "@/lib/supabaseClient";

await createProduct({
  title: "Sculpted Cashmere Evening Cape",
  category: "Women",
  price: 3900,
  image_url: "https://images.unsplash.com/photo-...",
  secondary_image_url: "https://images.unsplash.com/photo-...",
  description: "Cut from ultra-dense double-faced cashmere with sculptural standing collar.",
  details: "100% Loro Piana Cashmere • Hand-Finished in Paris",
});
```

### 4.4 Modifying Sizing Systems
- Men's Sizing default: French tailored jackets & coats (`46`, `48`, `50`, `52`, `54`).
- Women's Sizing default: French runway sizing (`36`, `38`, `40`, `42`, `44`).
- Located in `app/(storefront)/product/[id]/page.tsx` line `82`:
  ```typescript
  const SIZES = product.category === "Men" 
    ? ["46", "48", "50", "52", "54"] 
    : ["36", "38", "40", "42", "44"];
  ```

---

## 5. Troubleshooting & Maintenance

| Symptom / Issue | Root Cause | Solution |
|---|---|---|
| **Supabase Status: Amber / Local Resilience** | Supabase `anon` key is empty or invalid. | Open Admin Studio ➔ Click "Supabase Connection" ➔ Paste your Supabase `anon` key and click "Save & Connect". |
| **"relation 'products' does not exist"** | Table `products` has not been initialized in Supabase. | Copy the SQL DDL snippet in Section 3.1 and execute it in your Supabase project's SQL Editor. |
| **Remote image fails to render** | Unsplash or external domain not whitelisted in Next.js. | Check `next.config.ts`. Remote pattern is currently configured for `protocol: 'https', hostname: '**'` to allow all secure images. |
| **Port 3000 busy** | Another process is holding port 3000. | Next.js automatically suggests port 3001, or run `Get-Process node | Stop-Process` in PowerShell. |

---

*This guide should be referenced whenever modifying Mozart codebase, designing new components, or integrating third-party services.*
