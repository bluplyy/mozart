"use client";

import { useState } from "react";
import { useProducts } from "@/context/ProductContext";
import { Product } from "@/lib/types";
import ProductTable from "@/components/admin/ProductTable";
import ProductModal from "@/components/admin/ProductModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import SupabaseSettingsModal from "@/components/admin/SupabaseSettingsModal";
import {
  Database,
  Plus,
  Layers,
  Sparkles,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminPage() {
  const {
    products,
    loading,
    isUsingSupabase,
    addProduct,
    editProduct,
    removeProduct,
    supabaseError,
  } = useProducts();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Metrics
  const totalValue = products.reduce((acc, p) => acc + p.price, 0);
  const menCount = products.filter((p) => p.category === "Men").length;
  const womenCount = products.filter((p) => p.category === "Women").length;

  const handleAddNew = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleDeletePrompt = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleSaveProduct = async (productData: Omit<Product, "id"> & { id?: string }) => {
    if (productData.id) {
      const res = await editProduct(productData.id, productData);
      if (res.success) {
        showNotification("Piece successfully updated in archive.");
      } else {
        alert(res.error || "Failed to update product.");
      }
    } else {
      const res = await addProduct(productData);
      if (res.success) {
        showNotification("New piece added to the collection.");
      } else {
        alert(res.error || "Failed to create product.");
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const res = await removeProduct(productToDelete.id);
      if (res.success) {
        showNotification("Creation de-listed from catalog.");
      } else {
        alert(res.error || "Failed to delete product.");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-8 right-8 z-50 bg-black text-white px-6 py-3.5 shadow-2xl text-[11px] tracking-[0.2em] uppercase font-medium border border-neutral-700 flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Top Header */}
      <div className="flex items-end justify-between border-b border-black/[0.08] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-semibold block mb-1">
            Backoffice Management
          </span>
          <h1 className="font-serif text-4xl tracking-[0.1em] uppercase font-normal text-neutral-900">
            Catalog & Inventory Studio
          </h1>
        </div>

        {/* Top Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSettingsOpen(true)}
            className="border border-neutral-300 bg-white hover:border-black text-neutral-800 text-[11px] tracking-[0.2em] uppercase font-semibold py-3 px-5 flex items-center space-x-2 transition-all"
          >
            <Database size={13} />
            <span>Supabase Connection</span>
            <span
              className={`w-2 h-2 rounded-full ml-1 ${
                isUsingSupabase ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
          </button>

          <button
            onClick={handleAddNew}
            className="bg-[#09090b] hover:bg-black text-white text-[11px] tracking-[0.2em] uppercase font-semibold py-3 px-6 flex items-center space-x-2 transition-colors"
          >
            <Plus size={14} />
            <span>Create New Piece</span>
          </button>
        </div>
      </div>

      {/* Supabase Status Banner */}
      <div
        className={`p-4 border flex items-center justify-between text-[12px] ${
          isUsingSupabase
            ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
            : "bg-amber-50/70 border-amber-300 text-amber-950"
        }`}
      >
        <div className="flex items-center space-x-3">
          {isUsingSupabase ? (
            <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
          ) : (
            <AlertTriangle size={18} className="text-amber-700 shrink-0" />
          )}
          <div>
            <span className="font-semibold uppercase tracking-wider mr-2">
              {isUsingSupabase ? "Supabase Active:" : "Supabase Notice:"}
            </span>
            <span className="font-light">
              {isUsingSupabase
                ? "Connected to 'https://kafchlvjbbauchwuehyt.supabase.co'. Realtime persistence enabled."
                : supabaseError
                ? `Supabase: ${supabaseError}. Operating in offline resilience mode.`
                : "Enter your Supabase anon public key to synchronize live creations."}
            </span>
          </div>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="text-[10px] uppercase tracking-[0.2em] font-semibold underline underline-offset-4 hover:opacity-80"
        >
          {isUsingSupabase ? "View Supabase Config" : "Setup Anon Key"}
        </button>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-4 gap-6">
        {/* Total Pieces */}
        <div className="bg-[#fafaf8] p-6 border border-neutral-200">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">
              Active Archive
            </span>
            <Layers size={16} />
          </div>
          <div className="font-serif text-3xl text-neutral-900 font-normal">
            {products.length} <span className="text-[13px] font-sans font-light text-neutral-500">pieces</span>
          </div>
        </div>

        {/* Men's Pieces */}
        <div className="bg-[#fafaf8] p-6 border border-neutral-200">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">
              Men's Collection
            </span>
            <span className="text-[10px] uppercase tracking-widest text-neutral-900 font-bold">
              MEN
            </span>
          </div>
          <div className="font-serif text-3xl text-neutral-900 font-normal">
            {menCount} <span className="text-[13px] font-sans font-light text-neutral-500">creations</span>
          </div>
        </div>

        {/* Women's Pieces */}
        <div className="bg-[#fafaf8] p-6 border border-neutral-200">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">
              Women's Collection
            </span>
            <span className="text-[10px] uppercase tracking-widest text-neutral-900 font-bold">
              WOMEN
            </span>
          </div>
          <div className="font-serif text-3xl text-neutral-900 font-normal">
            {womenCount} <span className="text-[13px] font-sans font-light text-neutral-500">creations</span>
          </div>
        </div>

        {/* Catalog Value */}
        <div className="bg-[#fafaf8] p-6 border border-neutral-200">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">
              Total Catalog Value
            </span>
            <DollarSign size={16} />
          </div>
          <div className="font-serif text-3xl text-neutral-900 font-normal">
            ${totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Product Management Table */}
      <ProductTable
        products={products}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDeletePrompt}
      />

      {/* Modals */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={selectedProduct}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        product={productToDelete}
      />

      <SupabaseSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
