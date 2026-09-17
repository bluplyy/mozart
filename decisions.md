# Catatan Keputusan Arsitektur & Desain (Architecture Decision Records) — MOZART

Dokumen ini mencatat seluruh keputusan penting (*Architecture Decision Records* / ADR), rasionalisasi, komparasi alternatif, serta konsekuensi teknis dan desain dalam pembangunan platform e-commerce fashion mewah **MOZART**.

---

## Daftar Keputusan (Table of Decisions)

| ID | Topik Keputusan | Status | Tanggal |
|---|---|---|---|
| [ADR-001](#adr-001-pemilihan-framework-nextjs-app-router) | Pemilihan Framework: Next.js App Router | **DITERIMA** | 2026-09-17 |
| [ADR-002](#adr-002-identitas-visual-haute-couture-editorial-vs-e-commerce-generik) | Identitas Visual: Haute Couture Editorial Minimalis | **DITERIMA** | 2026-09-17 |
| [ADR-003](#adr-003-pembatasan-kategori-ketat-hanya-men-dan-women) | Pembatasan Kategori Ketat: Hanya "Men" dan "Women" | **DITERIMA** | 2026-09-17 |
| [ADR-004](#adr-004-cakupan-layar-desktop-first-1280px1920px) | Cakupan Layar: Desktop-First (1280px–1920px) | **DITERIMA** | 2026-09-17 |
| [ADR-005](#adr-005-arsitektur-database-supabase-dengan-offline-resilience-fallback) | Arsitektur Database: Supabase dengan Offline Resilience | **DITERIMA** | 2026-09-17 |
| [ADR-006](#adr-006-struktur-dual-portal-storefront-dan-admin-studio) | Struktur Dual Portal: Storefront & Admin Studio Terpadu | **DITERIMA** | 2026-09-17 |
| [ADR-007](#adr-007-rasio-aspek-foto-potret-34-dan-efek-dual-image-cross-fade) | Rasio Foto Potret 3:4 & Efek Dual-Image Cross-Fade | **DITERIMA** | 2026-09-17 |
| [ADR-008](#adr-008-manajemen-state-react-context-api-vs-state-library-eksternal) | Manajemen State: React Context API Terarah | **DITERIMA** | 2026-09-17 |
| [ADR-009](#adr-009-konfigurasi-kunci-supabase-melalui-ui-tanpa-restart-server) | Konfigurasi Kunci Supabase Melalui UI Tanpa Restart | **DITERIMA** | 2026-09-17 |
| [ADR-010](#adr-010-kebijakan-optimasi-gambar-eksternal-pada-nextconfigts) | Kebijakan Optimasi Gambar Eksternal di Next.js | **DITERIMA** | 2026-09-17 |

---

### ADR-001: Pemilihan Framework: Next.js App Router

- **Status**: DITERIMA
- **Konteks**:
  Kebutuhan aplikasi mencakup etalase pelanggan dengan performa tinggi, perutean dinamis untuk halaman detail produk (`/product/[id]`), struktur portal admin internal, serta integrasi database cloud.
- **Keputusan**:
  Menggunakan **Next.js (App Router)** dengan TypeScript dan Turbopack.
- **Alternatif yang Dipertimbangkan**:
  1. *Vite SPA (Single Page Application)*: Cepat untuk setup awal, namun tidak memiliki kapabilitas Server-Side Rendering (SSR) dan optimasi metadata editorial yang penting bagi platform luxury.
  2. *Next.js Pages Router*: Ekosistem matang, namun merupakan paradigma legacy yang kurang optimal untuk layout bersarang (*nested layouts*) antara Storefront dan Studio Admin.
- **Konsekuensi & Dampak**:
  - (+) Pemisahan layout bersih antara `(storefront)/layout.tsx` dan `admin/layout.tsx`.
  - (+) Kecepatan kompilasi Turbopack sub-detik (~500ms).
  - (+) Dukungan bawaan untuk TypeScript dan routing berbasis folder.

---

### ADR-002: Identitas Visual: Haute Couture Editorial vs E-Commerce Generik

- **Status**: DITERIMA
- **Konteks**:
  Klien menginginkan website busana dengan nuansa minimalis mewah seperti *Louis Vuitton, Chanel, Gucci, dan Prada*. Situs e-commerce biasa umumnya terlalu padat, menggunakan warna primer mencolok, dan banyak banner promosi yang merusak citra eksklusivitas.
- **Keputusan**:
  Mengadopsi filosofi desain **Quiet Luxury & Architectural Minimalism**:
  - Palet monokromatik: Hitam obsidian pekat (`#09090b`), alabaster hangat (`#fafaf8`), dan garis batas rambut (*hairline border*) `rgba(0,0,0,0.08)`.
  - Pasangan font editorial: Tipografi serif *Italiana* / *Cormorant Garamond* berjarak renggang (*wide letter-spacing / tracking*) dipadukan dengan sans-serif modern *Plus Jakarta Sans*.
  - *Whitespace* yang sangat lapang untuk membiarkan produk menjadi pusat perhatian.
- **Alternatif yang Dipertimbangkan**:
  1. *UI Kit Komersial Standar (Bootstrap/Material)*: Menghasilkan tampilan generic toko online biasa yang menurunkan persepsi nilai barang mewah.
- **Konsekuensi & Dampak**:
  - (+) Tampilan terasa sangat berkelas, artistik, dan sesuai standar rumah mode Paris/Milan.
  - (-) Memerlukan kurasi visual foto berkualitas tinggi agar estetika tetap terjaga.

---

### ADR-003: Pembatasan Kategori Ketat: Hanya "Men" dan "Women"

- **Status**: DITERIMA
- **Konteks**:
  Sesuai kebutuhan awal pengguna, produk busana hanya dibagi menjadi 2 kategori utama: pria (*Men*) dan wanita (*Women*).
- **Keputusan**:
  Menerapkan tipe data diskrit `export type Category = "Men" | "Women"` pada TypeScript dan constraint SQL `check (category in ('Men', 'Women'))` pada basis data Supabase.
- **Alternatif yang Dipertimbangkan**:
  1. *Sub-kategori multi-tingkat (Accessories, Shoes, Fragrance)*: Memperumit navigasi dan form input admin sebelum skala katalog membutuhkannya.
- **Konsekuensi & Dampak**:
  - (+) Logika filter sangat sederhana, efisien, dan bebas bug.
  - (+) Navigasi utama fokus dan terarah (halaman `/men` dan `/women`).
  - (-) Jika di kemudian hari ingin menambah kategori unisex atau kids, constraint enum database perlu di-alter.

---

### ADR-004: Cakupan Layar: Desktop-First (1280px–1920px)

- **Status**: DITERIMA
- **Konteks**:
  Pengguna secara eksplisit meminta pembuatan difokuskan pada layar desktop terlebih dahulu.
- **Keputusan**:
  Mengoptimalkan seluruh elemen UI (lebar kontainer `max-w-[1720px]`, tata letak *asymmetric 12-column grid*, *split-screen lookbook* tinggi 680px, dan *sticky purchasing panel*) untuk resolusi desktop 1280px hingga 1920px.
- **Alternatif yang Dipertimbangkan**:
  1. *Full Mobile-Responsive Redundancy*: Menambah overhead penyesuaian breakpoint mobile yang berisiko mengompromikan detail tampilan desktop editorial di tahap awal.
- **Konsekuensi & Dampak**:
  - (+) Fokus 100% pada pengalaman pengguna desktop yang spektakuler, proporsional, dan presisi.
  - (-) Tampilan pada layar smartphone belum dioptimalkan secara responsif (sesuai instruksi cakupan awal).

---

### ADR-005: Arsitektur Database: Supabase dengan Offline Resilience Fallback

- **Status**: DITERIMA
- **Konteks**:
  Aplikasi terhubung ke basis data Supabase (proyek *"fashion store"* di `https://kafchlvjbbauchwuehyt.supabase.co`). Namun, saat token autentikasi anon belum dimasukkan atau jaringan tidak stabil, aplikasi tidak boleh mengalami *crash* atau menampilkan layar putih (*white screen*).
- **Keputusan**:
  Mengimplementasikan **Offline-First Resilience Pattern** pada `lib/supabaseClient.ts`:
  1. Jika Supabase client aktif dan tabel siap, seluruh operasi (Fetch, Insert, Update, Delete) berjalan di cloud database Supabase.
  2. Jika kunci belum dipasang atau terjadi error jaringan, aplikasi secara otomatis beralih ke penyimpanan lokal browser (`localStorage`) yang diisi oleh data awal `INITIAL_PRODUCTS`.
- **Alternatif yang Dipertimbangkan**:
  1. *Strict Cloud-Only (Hard Failure)*: Aplikasi langsung melempar error dan blank jika API key belum ada. Pengalaman pengembang/pengguna menjadi sangat buruk.
- **Konsekuensi & Dampak**:
  - (+) Aplikasi selalu 100% dapat dibuka dan didemokan tanpa prasyarat setup yang kaku.
  - (+) Perubahan data di admin tetap instan dan sinkron di etalase toko.
  - (-) Pengembang perlu memastikan sinkronisasi antara data lokal dan Supabase saat tombol *Seed* ditekan.

---

### ADR-006: Struktur Dual Portal: Storefront dan Admin Studio

- **Status**: DITERIMA
- **Konteks**:
  Diperlukan dua fungsi utama: antarmuka etalase untuk customer dan antarmuka manajemen untuk admin (tambah, edit, hapus foto, judul, deskripsi).
- **Keputusan**:
  Membangun kedua portal di dalam satu repositori Next.js dengan pemisahan *route group*:
  - `app/(storefront)/`: Bertanggung jawab atas pengalaman belanja pelanggan.
  - `app/admin/`: Bertanggung jawab atas pengelolaan inventaris, metrik katalog, dan sinkronisasi Supabase.
- **Alternatif yang Dipertimbangkan**:
  1. *Dua Repositori Terpisah (Micro-frontends)*: Menambah kompleksitas deployment dan konfigurasi CORS berlebih untuk skala proyek saat ini.
- **Konsekuensi & Dampak**:
  - (+) Berbagi tipe data TypeScript (`lib/types.ts`) dan context state tanpa duplikasi.
  - (+) Transisi instan antara mode Storefront dan Studio melalui link navigasi di navbar.

---

### ADR-007: Rasio Aspek Foto Potret 3:4 dan Efek Dual-Image Cross-Fade

- **Status**: DITERIMA
- **Konteks**:
  Karakteristik utama e-commerce fashion mewah adalah fotografi yang dramatis dan detail tekstur pakaian.
- **Keputusan**:
  - Mengunci rasio kartu produk dan galeri pada rasio potret **3:4** (`aspect-[3/4]`).
  - Mengimplementasikan transisi dua gambar: foto utama menampilkan model utuh, dan saat di-*hover* bertransisi halus (*opacity cross-fade* 700ms) ke foto sekunder yang menampilkan siluet atau detail kain.
- **Alternatif yang Dipertimbangkan**:
  1. *Rasio Kotak 1:1*: Standar e-commerce generik yang sering memotong proporsi gaun panjang atau mantel musim dingin.
- **Konsekuensi & Dampak**:
  - (+) Siluet busana tampil natural dari atas hingga bawah (*head-to-toe drape*).
  - (+) Memberikan nuansa interaktif yang mewah bagi pengunjung toko.

---

### ADR-008: Manajemen State: React Context API Terarah

- **Status**: DITERIMA
- **Konteks**:
  Diperlukan sinkronisasi state keranjang belanja (`CartContext`) dan sinkronisasi produk (`ProductContext`) antar halaman.
- **Keputusan**:
  Menggunakan **React Context API** bawaan yang diintegrasikan dengan `localStorage`.
- **Alternatif yang Dipertimbangkan**:
  1. *Redux Toolkit*: Terlalu banyak boilerplate untuk kebutuhan state MOZART.
  2. *Zustand*: Pilihan alternatif yang baik, namun React Context bawaan sudah lebih dari cukup dan tidak menambah dependensi eksternal tambahan.
- **Konsekuensi & Dampak**:
  - (+) Dependensi minimal, kode ringkas, dan performa optimal.
  - (+) Pembaruan produk di admin langsung terrefleksi secara reaktif di halaman katalog dan halaman detail produk.

---

### ADR-009: Konfigurasi Kunci Supabase Melalui UI Tanpa Restart Server

- **Status**: DITERIMA
- **Konteks**:
  Banyak pengguna kesulitan mengedit file `.env.local` dan harus me-restart server setiap kali memperbarui API key Supabase.
- **Keputusan**:
  Membuat **Modal Pengaturan Supabase** langsung di dalam Admin Studio (`/admin`):
  - Membaca dan menyimpan `anon key` ke `localStorage` jika `.env.local` belum terisi.
  - Menyediakan tombol **"Seed Mozart Catalog to Supabase"** untuk mengimpor koleksi busana awal hanya dalam satu klik.
- **Alternatif yang Dipertimbangkan**:
  1. *Hanya melalui file `.env.local`*: Memaksa restart dev server dan menyulitkan pengujian cepat.
- **Konsekuensi & Dampak**:
  - (+) Fleksibilitas tinggi bagi admin untuk menguji koneksi database secara langsung dari antarmuka visual.

---

### ADR-010: Kebijakan Optimasi Gambar Eksternal di Next.js

- **Status**: DITERIMA
- **Konteks**:
  Foto busana mewah di-*host* di berbagai sumber eksternal seperti Unsplash CDN dan Supabase Storage bucket. Secara default, Next.js memblokir domain eksternal yang belum terdaftar.
- **Keputusan**:
  Mendaftarkan pola *remote patterns* wildcard pada `next.config.ts`:
  ```typescript
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  }
  ```
- **Alternatif yang Dipertimbangkan**:
  1. *Mendaftarkan satu per satu domain*: Kurang fleksibel jika admin memasukkan URL gambar dari CDN atau bucket baru.
- **Konsekuensi & Dampak**:
  - (+) Admin bebas memasukkan URL gambar berkualitas tinggi dari domain HTTPS mana pun tanpa mengalami error runtime Next.js.
