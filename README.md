# MOZART — Haute Couture & Architecture of Silhouette

A minimalist luxury e-commerce web platform inspired by iconic European fashion houses (*Louis Vuitton, Chanel, Gucci, Prada, and The Row*), engineered with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and connected to **Supabase**.

---

## 🏛️ Key Features & Architecture

### 1. Customer Storefront
- **Haute Couture Aesthetic**: Monochromatic palette (deep obsidian `#09090b`, warm alabaster `#fafaf8`, hairline borders), wide-tracked serif typography (*Italiana* & *Cormorant Garamond*), and generous editorial whitespace.
- **Editorial Campaign Homepage**: Full-viewport cinematic hero banner, interactive **Two Universes Split Gateway** (*L'Homme & La Femme*), curated seasonal highlights, and brand manifesto.
- **Dedicated Men's & Women's Collections**: Strictly segregated 2-category structure with 3:4 portrait aspect ratio cards, 700ms dual-photo hover cross-fade, and price sorting.
- **Asymmetrical Product Detail Page (PDP)**: High-resolution editorial gallery on the left, sticky purchasing drawer on the right with French sizing (36–44 / 46–54) and artisan care accordions.
- **Slide-out Shopping Bag**: Real-time quantity management, complimentary courier notice, subtotal calculation, and atelier order placement.
- **Two-Step Client Registration & Email OTP**: Secure registration with 6-digit confirmation code retrieved via real Gmail or the in-app Webmail simulator (`/gmail`).
- **Private Salon Patron Dossier (`/account`)**: VIP membership tier status and acquisition order history.

### 2. Admin Studio Portal (`/admin`)
- **Route Guard Protection**: Automatic barrier redirecting unauthenticated users to `/admin/login`.
- **Curator Control Room**: Real-time KPI metrics cards (Active Archive, Men's count, Women's count, Total Catalog Value in USD).
- **Product Catalog Management**: Instant keyword search, category tabs (`All`, `Men`, `Women`), live pricing, and stock status.
- **Product Creation & Modification Modal**: Full CRUD with live thumbnail preview and 1-click curated luxury lookbook presets.
- **Supabase Cloud Synchronization**: In-browser API key configuration modal with 1-click database seeding.

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/bluplyy/mozart.git
cd mozart
npm install
```

### 2. Running Locally
```bash
npm run dev
```

Open in your desktop browser:
- **Customer Storefront**: [http://localhost:3000](http://localhost:3000)
- **Admin Studio**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Gmail Webmail Simulator**: [http://localhost:3000/gmail](http://localhost:3000/gmail)

---

## 🔑 Pre-Configured Demo Accounts

| Portal | Role | Email | Password |
|---|---|---|---|
| **Customer Storefront** | Client Patron | `client@mozart.com` | `password123` |
| **Admin Studio** | Maison Curator | `admin@mozart.com` | `atelier2026` |

---

## 🗄️ Supabase Setup (Optional)

The application features an **Offline-First Resilience Fallback**, operating seamlessly even without cloud credentials. To connect your live Supabase project:
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Enter your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. In your Supabase SQL Editor, run the schema defined in `design.md` or click **"Seed Mozart Catalog to Supabase"** from the Admin panel!

---

## 📄 Documentation

- [design.md](design.md): Comprehensive UI/UX Design System, Design Tokens & Layout Specs.
- [skill.md](skill.md): Developer Operations Playbook, DDL SQL, and Runbook.
- [decisions.md](decisions.md): Architecture Decision Records (ADRs).
- [learnings.md](learnings.md): Technical Insights, Gotchas, and Solutions.

---

© MOZART HAUTE COUTURE • PARIS • ALL RIGHTS RESERVED.
