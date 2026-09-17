# Catatan Pembelajaran Proyek (Project Learnings) — MOZART Haute Couture

Dokumen ini mendokumentasikan wawasan teknis (*technical insights*), temuan kendala dan solusinya (*gotchas & debugging*), pelajaran desain UI/UX, serta rekomendasi arsitektural yang diperoleh selama perancangan dan pembangunan platform e-commerce fashion mewah **MOZART**.

---

## 1. Lingkungan Runtime & Tooling (Node.js & npm)

### 1.1 Penanganan Restriksi Penamaan Package pada npm CLI
- **Temuan**: Saat menjalankan `create-next-app` langsung pada direktori yang memiliki huruf kapital (`FashionStore`), npm menolak eksekusi dengan pesan:
  ```text
  Could not create a project called "FashionStore" because of npm naming restrictions:
  * name can no longer contain capital letters
  ```
- **Pelajaran & Solusi**:
  1. npm strictly memberlakukan penamaan *all-lowercase* (kebab-case) untuk `name` di `package.json`.
  2. Solusi terbaik adalah membuat project sementara dengan nama `mozart-fashion-store` atau bootstrap di subfolder temporer (`temp-app`), kemudian memindahkan file ke *root workspace*.
  3. Sinkronisasi nama package di `package.json` dan `package-lock.json` melalui `npm install --package-lock-only` menjaga konsistensi dependensi tree.

### 1.2 Kebijakan Baru `allow-scripts` pada npm v11
- **Temuan**: Pada npm versi 11.17.0, terdapat fitur keamanan baru di level user `.npmrc` berupa `allow-scripts`. Jika dikonfigurasi secara terbatas (misalnya `allow-scripts = 9router`), npm memblokir instalasi paket lain dengan error `EALLOWSCRIPTS`.
- **Pelajaran & Solusi**:
  Menghapus restriksi global dengan `npm config delete allow-scripts` memulihkan instalasi dependensi reguler (@supabase/supabase-js, lucide-react) secara bersih dan aman.

---

## 2. Arsitektur Next.js 16 (App Router) & Tailwind CSS v4

### 2.1 Isolasi Layout Melalui Route Groups `(storefront)`
- **Temuan**: Aplikasi membutuhkan dua antarmuka yang sangat berbeda secara visual:
  - Storefront: Nuansa editorial *warm alabaster*, navbar mewah dengan brandmark, dan footer haute couture.
  - Admin Studio: Nuansa *dark studio control room*, tanpa footer e-commerce, dengan sidebar dan metrik KPI.
- **Pelajaran**:
  Menggunakan pola *Route Groups* Next.js:
  - `app/(storefront)/layout.tsx` membungkus rute `/`, `/men`, `/women`, dan `/product/[id]`.
  - `app/admin/layout.tsx` membungkus rute `/admin`.
  Pola ini menjaga URL tetap bersih (tanpa prefix `(storefront)`) sekaligus mencegah bocornya styling admin ke etalase pelanggan.

### 2.2 Aturan Urutan `@import` CSS pada Turbopack
- **Temuan**: Ketika `@import url('https://fonts.googleapis.com/...')` ditempatkan setelah `@import "tailwindcss";`, compiler CSS Next.js memunculkan peringatan optimasi:
  ```text
  Found 1 warning while optimizing generated CSS:
  @import rules must precede all rules aside from @charset and @layer statements
  ```
- **Pelajaran**:
  Seluruh `@import` font eksternal wajib diletakkan di baris paling awal dari file `globals.css` sebelum statement Tailwind atau aturan CSS lokal lainnya agar proses kompilasi berjalan 100% tanpa warning.

### 2.3 Kebijakan Remote Images untuk Foto Resolusi Tinggi
- **Temuan**: Busana mewah memerlukan foto beresolusi sangat tinggi dari berbagai fotografer mode (misalnya dari Unsplash CDN dan Supabase Storage bucket). Secara default Next.js memblokir domain eksternal tak dikenal.
- **Pelajaran**:
  Mendaftarkan wildcard pattern pada `next.config.ts`:
  ```typescript
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  }
  ```
  memberikan kebebasan penuh bagi pengelola katalog untuk memasukkan URL foto dari CDN manapun tanpa menimbulkan error runtime.

---

## 3. Integrasi Supabase & Pola "Offline-First Resilience"

### 3.1 Tantangan Initial Credentials & Mencegah White Screen
- **Temuan**: Dalam pengembangan aplikasi nyata, sering terjadi situasi di mana API key database cloud belum dimasukkan, token kadaluarsa, atau tabel SQL belum di-create di Supabase dashboard. Jika aplikasi langsung melakukan hard-fetch tanpa proteksi, halaman akan crash atau menampilkan *white screen*.
- **Pelajaran & Solusi**:
  Diterapkan pola **Graceful Local Fallback**:
  ```typescript
  // lib/supabaseClient.ts
  export async function fetchProducts() {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (!error && data && data.length > 0) return { products: data, isSupabase: true };
      } catch (err) { /* fallback */ }
    }
    // Fallback otomatis ke localStorage / seed data
    return { products: getLocalFallback(), isSupabase: false };
  }
  ```
  Dengan arsitektur ini:
  1. Aplikasi selalu tampil memukau saat pertama kali dibuka.
  2. Begitu `anon key` dimasukkan, sistem langsung sinkron ke Supabase cloud secara otomatis.

### 3.2 Penyediaan Konfigurasi Kunci Melalui Antarmuka Visual
- **Temuan**: Mengharuskan pengguna mengedit file `.env.local` dan me-restart terminal dev server seringkali memperlambat alur kerja pengujian.
- **Pelajaran**:
  Menyediakan tombol **"Supabase Connection"** di dalam Admin Studio yang memungkinkan pengguna:
  - Menempelkan `anon key` secara langsung di browser.
  - Menguji koneksi seketika (*instant verification*).
  - Menekan tombol **"Seed Mozart Catalog to Supabase"** untuk menginjeksi 8 busana mewah ke database Supabase hanya dalam 1 klik.

---

## 4. Pelajaran Desain UI/UX: Mereplikasi Standar Haute Couture

### 4.1 Menghindari "Jebakan E-Commerce Biasa"
- **Temuan**: Desain e-commerce konvensional (seperti Amazon atau marketplace lokal) mengutamakan kepadatan informasi: badge diskon merah menyala, tombol *buy now* oranye/hijau terang, dan banner promosi yang berdesakan. Gaya ini bertolak belakang dengan psikologi barang mewah.
- **Pelajaran**:
  Rumah mode seperti *Louis Vuitton, Chanel, Gucci, dan Prada* mengandalkan:
  - **Monokrom & Ruang Lapang**: Menghilangkan warna-warna saturasi tinggi; membiarkan warna busana itu sendiri yang berbicara.
  - **Tipografi Renggang (High Tracking)**: Menggunakan `letter-spacing: 0.2em` hingga `0.35em` pada teks kapital berukuran kecil (10px–11px) menciptakan kesan eksklusif dan prestisius.
  - **Hairline Borders**: Garis pemisah setebal 1px dengan opasitas rendah (`rgba(0,0,0,0.08)`) memberikan struktur tanpa membebani mata.

### 4.2 Rasio Aspek Foto Potret 3:4 vs Kotak 1:1
- **Temuan**: Rasio kotak 1:1 memotong proporsi vertikal busana, terutama mantel musim dingin (*overcoat*), *trench coat*, dan gaun malam panjang (*column gown*).
- **Pelajaran**:
  Rasio **3:4 Portrait** (`aspect-[3/4]`) adalah standar emas visual industri fashion dunia karena menampilkan keseluruhan siluet model dari kepala hingga ujung sepatu (*head-to-toe silhouette*).

### 4.3 Mikro-Interaksi yang Halus & Tenang
- **Temuan**: Animasi yang terlalu cepat (*bouncy / playful*) terasa kekanak-kanakan untuk brand busana mewah.
- **Pelajaran**:
  Transisi kurva lambat **700ms** dengan kurva `cubic-bezier(0.16, 1, 0.3, 1)` untuk efek *hover cross-fade* foto utama ke foto sekunder memberikan kesan tenang, anggun, dan berbobot (*calm & deliberate elegance*).

---

## 5. Manajemen State & Sinkronisasi Data

### 5.1 Penanganan Hidrasi State Keranjang Belanja (React 19)
- **Temuan**: Membaca data keranjang belanja dari `localStorage` secara langsung saat inisialisasi state komponen dapat menimbulkan *hydration mismatch warning* antara SSR dan Client.
- **Pelajaran**:
  Menggunakan pola *mounted guard*:
  ```tsx
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("mozart_shopping_bag");
    if (stored) setItems(JSON.parse(stored));
  }, []);
  ```
  Pola ini menjamin server me-render state awal yang konsisten, lalu me-rehidrasi keranjang belanja di browser tanpa warning console.

### 5.2 Optimistic Updates pada Panel Admin
- **Temuan**: Saat admin menambah, mengedit, atau menghapus busana, menunggu respon network sebelum memperbarui tabel menciptakan jeda (*latency*) yang menurunkan kenyamanan kerja kurator.
- **Pelajaran**:
  Menerapkan *optimistic updates* di mana state lokal `products` diperbarui seketika sembari proses async database berjalan di latar belakang.

---

## 6. Rekomendasi Roadmap Masa Depan (Future Iterations)

1. **Autentikasi Akses Admin (Supabase Auth)**:
   Menerapkan proteksi login berbasis email/password atau SSO khusus kurator atelier untuk mengamankan rute `/admin`.
2. **Direct Storage Upload (Supabase Storage)**:
   Menyediakan komponen drag-and-drop file upload untuk mengunggah foto langsung ke bucket `mozart-catalog` di Supabase Storage, bukan hanya menempelkan URL gambar eksternal.
3. **Gerbang Pembayaran Nyata (Payment Gateway)**:
   Mengintegrasikan Stripe Elements atau Midtrans untuk memproses transaksi kartu kredit riil saat menekan tombol *"Proceed to Atelier Checkout"*.
4. **Ekspansi Responsivitas Seluler (Mobile Viewport)**:
   Mengembangkan tata letak khusus layar ponsel (drawer navigasi samping, tombol add-to-cart mengambang di bawah) saat strategi bisnis beralih ke mobile.

---

*Dokumen ini menjadi referensi pembelajaran kolektif bagi tim pengembang untuk menjaga standar kualitas kode dan estetika visual MOZART.*
