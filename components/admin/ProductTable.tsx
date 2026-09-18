"use client";

import { useState } from "react";
import { Product, Category } from "@/lib/types";
import { Edit2, Trash2, Search, Plus, Filter } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddNew: () => void;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onAddNew,
}: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | Category>("All");

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.details && p.details.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#fafaf8] border border-neutral-200">
      {/* Controls Bar */}
      <div className="p-6 border-b border-black/[0.06] flex items-center justify-between gap-4">
        {/* Category Filter Tabs */}
        <div className="flex items-center space-x-2">
          {(["All", "Men", "Women"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] tracking-[0.2em] uppercase font-medium px-4 py-2 transition-all ${
                selectedCategory === cat
                  ? "bg-black text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:border-black"
              }`}
            >
              {cat === "All" ? `All Pieces (${products.length})` : `${cat} (${products.filter((p) => p.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Search & Add New */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="FILTER BY KEYWORD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-neutral-300 pl-9 pr-4 py-2 text-[11px] uppercase tracking-wider text-neutral-900 focus:border-black outline-none w-64 font-mono"
            />
          </div>

          <button
            onClick={onAddNew}
            className="bg-[#09090b] hover:bg-black text-white px-5 py-2 text-[11px] tracking-[0.2em] uppercase font-semibold flex items-center space-x-2 transition-colors"
          >
            <Plus size={14} />
            <span>Add Creation</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.07] bg-[#f4f3ee]/80 text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-semibold">
              <th className="py-4 px-6 w-24">Visual</th>
              <th className="py-4 px-6">Creation & Silhouette</th>
              <th className="py-4 px-6 w-32">Category</th>
              <th className="py-4 px-6 w-32">Price (USD)</th>
              <th className="py-4 px-6 text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05] text-[13px]">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-neutral-400">
                  <span className="font-serif text-xl block uppercase tracking-widest mb-1">
                    No Creations Found
                  </span>
                  <span className="text-[11px] uppercase tracking-wider">
                    Try adjusting your filter or create a new product.
                  </span>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-100/60 transition-colors group">
                  {/* Visual */}
                  <td className="py-3 px-6">
                    <div className="w-14 h-18 bg-[#ebe8e2] overflow-hidden aspect-[3/4] border border-black/10">
                      <img
                        src={p.images?.[0] || p.image_url}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </td>

                  {/* Title & Sizes */}
                  <td className="py-3 px-6 max-w-xs">
                    <span className="font-medium text-neutral-900 tracking-wide block uppercase text-[12px]">
                      {p.title}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(["XS", "S", "M", "L", "XL"] as const).map((size) => {
                        const isAvailable = (p.available_sizes || ["XS", "S", "M", "L", "XL"]).includes(size);
                        return (
                          <span
                            key={size}
                            className={`text-[9px] font-mono px-1.5 py-0.2 border ${
                              isAvailable
                                ? "bg-black text-white border-black font-semibold"
                                : "bg-neutral-100 text-neutral-300 border-neutral-200 line-through"
                            }`}
                          >
                            {size}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-6">
                    <span
                      className={`inline-block px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase font-semibold ${
                        p.category === "Men"
                          ? "bg-neutral-900 text-white"
                          : "bg-[#e5e2db] text-neutral-900"
                      }`}
                    >
                      {p.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-6 font-sans font-medium text-neutral-900 tracking-wider">
                    ${p.price.toLocaleString()}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEdit(p)}
                        title="Edit Creation"
                        className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-200/80 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(p)}
                        title="De-list Creation"
                        className="p-2 text-neutral-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
