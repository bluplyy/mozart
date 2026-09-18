"use client";

import { useState, useEffect } from "react";
import { Product, Category } from "@/lib/types";
import { X, Sparkles, Image as ImageIcon } from "lucide-react";
import ProductImageManager from "./ProductImageManager";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, "id"> & { id?: string }) => Promise<void>;
  initialData?: Product | null;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ProductModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Men");
  const [price, setPrice] = useState<string>("1500");
  const [images, setImages] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>(["XS", "S", "M", "L", "XL"]);
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setPrice(initialData.price.toString());
      
      // Populate sizes
      if (initialData.available_sizes && initialData.available_sizes.length > 0) {
        setAvailableSizes(initialData.available_sizes);
      } else {
        setAvailableSizes(["XS", "S", "M", "L", "XL"]);
      }

      // Populate images array from initialData
      if (initialData.images && initialData.images.length > 0) {
        setImages(initialData.images);
      } else {
        const list: string[] = [];
        if (initialData.image_url) list.push(initialData.image_url);
        if (initialData.secondary_image_url) list.push(initialData.secondary_image_url);
        setImages(list);
      }
      
      setDescription(initialData.description);
      setDetails(initialData.details || "");
    } else {
      setTitle("");
      setCategory("Men");
      setPrice("2200");
      setAvailableSizes(["XS", "S", "M", "L", "XL"]);
      setImages([
        "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop",
      ]);
      setDescription("Sculpted with pure architectural discipline. Unlined interior with contrast hand-stitching.");
      setDetails("100% Virgin Wool • Made in Italy");
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Product title is required.");
      return;
    }
    if (images.length === 0) {
      setError("Minimal satu foto produk harus diupload.");
      return;
    }
    if (availableSizes.length === 0) {
      setError("Minimal satu ukuran (size) harus dipilih tersedia.");
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError("Please specify a valid price in USD.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const primaryImage = images[0];
      const secondaryImage = images.length > 1 ? images[1] : undefined;

      await onSave({
        id: initialData?.id,
        title: title.trim(),
        category,
        price: numPrice,
        image_url: primaryImage,
        secondary_image_url: secondaryImage,
        images: images,
        available_sizes: availableSizes,
        description: description.trim(),
        details: details.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
      <div className="bg-[#fafaf8] max-w-3xl w-full border border-neutral-300 shadow-2xl relative my-8">
        {/* Header */}
        <div className="px-8 py-6 border-b border-black/[0.08] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl tracking-[0.15em] uppercase text-neutral-900 font-medium">
              {initialData ? "Edit Mozart Piece" : "New Haute Couture Piece"}
            </h2>
            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mt-1">
              {initialData ? `Catalog Reference: ${initialData.id}` : "Publish new creation to the archive"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-black p-1 transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border-l-2 border-red-800 p-3 text-[12px] text-red-800 font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-700 font-semibold mb-2">
              Piece Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sculpted Double-Breasted Cashmere Coat"
              className="w-full bg-white border border-neutral-300 px-4 py-3 text-[13px] tracking-wider text-neutral-900 focus:border-black outline-none"
            />
          </div>

          {/* Category & Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Strict Category: Men vs Women */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-700 font-semibold mb-2">
                Category (Strict) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["Men", "Women"] as Category[]).map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-3 text-[11px] tracking-[0.25em] uppercase font-medium transition-all ${
                      category === cat
                        ? "bg-black text-white"
                        : "bg-white border border-neutral-300 text-neutral-600 hover:border-black"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-700 font-semibold mb-2">
                Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-[13px] text-neutral-400 font-serif">$</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2450"
                  className="w-full bg-white border border-neutral-300 pl-8 pr-4 py-3 text-[13px] font-sans text-neutral-900 focus:border-black outline-none"
                />
              </div>
            </div>
          </div>

          {/* Photo Manager (Upload, Drag & Drop, Reorder, Delete) - Replaces manual URL textboxes */}
          <div className="p-5 bg-white border border-neutral-200">
            <ProductImageManager
              images={images}
              onChange={setImages}
              disabled={saving}
            />
          </div>

          {/* Size Availability Selector: L, XL, M, S, XS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-neutral-700 font-semibold">
                Ketersediaan Ukuran (Size Availability) *
              </label>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                Klik untuk aktifkan / nonaktifkan size
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {(["XS", "S", "M", "L", "XL"] as const).map((size) => {
                const isSelected = availableSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setAvailableSizes(availableSizes.filter((s) => s !== size));
                      } else {
                        // Keep order in standard sequence: XS, S, M, L, XL
                        const all = ["XS", "S", "M", "L", "XL"];
                        const next = [...availableSizes, size].sort(
                          (a, b) => all.indexOf(a) - all.indexOf(b)
                        );
                        setAvailableSizes(next);
                      }
                    }}
                    className={`py-3 text-[12px] uppercase font-semibold tracking-wider border transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-neutral-100/70 border-neutral-300 text-neutral-400 hover:border-black hover:text-black"
                    }`}
                  >
                    <span>{size}</span>
                    <span className="text-[9px] tracking-widest font-normal opacity-80">
                      {isSelected ? "TERSEDIA" : "HABIS"}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-neutral-500 mt-2">
              Ukuran yang ditandai <span className="font-semibold text-black">TERSEDIA</span> akan dapat dipilih dan dibeli oleh pelanggan di halaman produk.
            </p>
          </div>

          {/* Fabric & Provenance Details */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-700 font-semibold mb-2">
              Materials, Hardware & Provenance
            </label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. 100% Cashmere • Horn Buttons • Handcrafted in Biella, Italy"
              className="w-full bg-white border border-neutral-300 px-4 py-3 text-[13px] text-neutral-900 focus:border-black outline-none"
            />
          </div>

          {/* Editorial Description */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-700 font-semibold mb-2">
              Editorial Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe silhouette, drape, atelier craft, and occasion..."
              className="w-full bg-white border border-neutral-300 px-4 py-3 text-[13px] text-neutral-900 focus:border-black outline-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-black/[0.08] flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-neutral-300 text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#09090b] hover:bg-black text-white px-8 py-3 text-[11px] tracking-[0.25em] uppercase font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? "Publishing..." : initialData ? "Save Changes" : "Publish Piece"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
