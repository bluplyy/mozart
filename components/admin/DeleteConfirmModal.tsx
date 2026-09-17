"use client";

import { Product } from "@/lib/types";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  product: Product | null;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  product,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-[#fafaf8] max-w-md w-full border border-neutral-300 shadow-2xl p-8 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-black transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={24} strokeWidth={1.5} />
        </div>

        <h3 className="font-serif text-2xl tracking-[0.1em] uppercase text-neutral-900 mb-2">
          De-list Creation
        </h3>
        <p className="text-[12px] uppercase tracking-[0.15em] text-neutral-500 mb-4">
          {product.title}
        </p>

        <p className="text-[13px] text-neutral-600 leading-relaxed font-light mb-8">
          Are you certain you wish to remove this creation from the active catalog? This action will remove it from both the Storefront and Database.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-neutral-300 text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-neutral-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-3 bg-red-700 hover:bg-red-800 text-white text-[11px] tracking-[0.2em] uppercase font-medium disabled:opacity-50 transition-colors"
          >
            {deleting ? "De-listing..." : "Delete Piece"}
          </button>
        </div>
      </div>
    </div>
  );
}
