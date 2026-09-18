"use client";

import React, { useRef, useState } from "react";
import { Upload, X, ArrowLeft, ArrowRight, GripVertical, CheckCircle2, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadProductImage } from "@/lib/storage";

interface ImageItem {
  id: string;
  url: string;
  isUploading?: boolean;
}

interface ProductImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}

export default function ProductImageManager({
  images,
  onChange,
  disabled = false,
}: ProductImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle file selection and upload
  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setUploadProgress(true);
    setUploadError(null);

    const uploadedUrls: string[] = [];
    try {
      for (const file of files) {
        const res = await uploadProductImage(file);
        if (res?.url) {
          uploadedUrls.push(res.url);
        }
      }
      onChange([...images, ...uploadedUrls]);
    } catch (err: any) {
      setUploadError(err?.message || "Failed to upload image.");
    } finally {
      setUploadProgress(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Reordering functions
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  // Drag-and-drop reordering between image cards
  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
    setDraggedIndex(index);
  };

  const handleItemDropOn = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceIndexStr = e.dataTransfer.getData("text/plain");
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      moveImage(sourceIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  const removeImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-800 font-semibold">
            Product Lookbook & Gallery ({images.length} photos)
          </label>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">
            Foto pertama adalah Foto Utama (Primary). Drag kartu untuk mengubah urutan.
          </span>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border-l-2 border-red-700 text-red-800 text-[11px]">
          {uploadError}
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploadProgress && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-black bg-neutral-100 scale-[0.99]"
            : "border-neutral-300 hover:border-black bg-white"
        } ${disabled || uploadProgress ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={disabled || uploadProgress}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {uploadProgress ? (
            <div className="flex items-center space-x-2 text-neutral-800">
              <Loader2 size={24} className="animate-spin text-neutral-800" />
              <span className="text-[12px] uppercase tracking-[0.15em] font-medium">
                Mengupload ke Supabase Storage...
              </span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 border border-neutral-200">
                <Upload size={18} />
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-[0.15em] font-semibold text-neutral-900">
                  Drag & Drop Foto ke Sini, atau <span className="underline">Pilih dari Komputer</span>
                </p>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 mt-0.5">
                  Format: JPG, PNG, WEBP, AVIF (Portret 3:4 Direkomendasikan)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grid of Images with Drag-to-Reorder & Action Buttons */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((url, idx) => {
            const isPrimary = idx === 0;
            const isSecondary = idx === 1;

            return (
              <div
                key={`${url}-${idx}`}
                draggable={!disabled}
                onDragStart={(e) => handleItemDragStart(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleItemDropOn(e, idx)}
                className={`relative group bg-[#edeae4] border transition-all overflow-hidden flex flex-col ${
                  draggedIndex === idx
                    ? "opacity-40 border-black scale-95"
                    : "border-neutral-200 hover:border-black"
                }`}
              >
                {/* Image Container with 3:4 ratio */}
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-200">
                  <img
                    src={url}
                    alt={`Product photo ${idx + 1}`}
                    className="w-full h-full object-cover object-center select-none"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute("src", "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600");
                    }}
                  />

                  {/* Badge: Primary / Secondary / Lookbook */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {isPrimary && (
                      <span className="bg-black text-white text-[9px] tracking-[0.2em] uppercase font-bold px-2 py-0.5 shadow-sm">
                        Primary
                      </span>
                    )}
                    {isSecondary && (
                      <span className="bg-white/90 backdrop-blur-sm text-black text-[9px] tracking-[0.2em] uppercase font-semibold px-2 py-0.5 shadow-sm">
                        Hover View
                      </span>
                    )}
                    {!isPrimary && !isSecondary && (
                      <span className="bg-black/60 backdrop-blur-sm text-white text-[9px] tracking-[0.2em] uppercase font-medium px-2 py-0.5">
                        #{idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    title="Hapus foto ini"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/80 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-colors z-10 shadow-sm"
                  >
                    <X size={14} />
                  </button>

                  {/* Drag Handle Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none transition-opacity">
                    <span className="bg-black/80 text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 font-medium flex items-center gap-1">
                      <GripVertical size={11} /> Drag Urutan
                    </span>
                  </div>
                </div>

                {/* Bottom Reorder Controls */}
                <div className="p-1.5 bg-white border-t border-neutral-200 flex items-center justify-between text-neutral-600">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveImage(idx, idx - 1)}
                    title="Geser ke kiri / urutan sebelumnya"
                    className="p-1 hover:text-black disabled:opacity-20 disabled:hover:text-neutral-400 transition-colors"
                  >
                    <ArrowLeft size={13} />
                  </button>

                  <span className="text-[9px] font-mono tracking-widest text-neutral-400">
                    POS {idx + 1}
                  </span>

                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => moveImage(idx, idx + 1)}
                    title="Geser ke kanan / urutan berikutnya"
                    className="p-1 hover:text-black disabled:opacity-20 disabled:hover:text-neutral-400 transition-colors"
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-[11px] text-neutral-400 italic text-center py-2">
          Belum ada foto produk. Silakan upload minimal 1 foto utama.
        </p>
      )}
    </div>
  );
}
