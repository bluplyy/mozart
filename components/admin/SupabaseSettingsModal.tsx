"use client";

import { useState } from "react";
import { useProducts } from "@/context/ProductContext";
import { X, Database, Check, AlertCircle, Sparkles, Copy } from "lucide-react";

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA = `-- Run in Supabase SQL Editor:
create table if not exists products (
  id text primary key,
  title text not null,
  category text not null check (category in ('Men', 'Women')),
  price numeric not null,
  image_url text not null,
  secondary_image_url text,
  images text[] default array[]::text[],
  available_sizes text[] default array['XS', 'S', 'M', 'L', 'XL']::text[],
  description text not null,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table products enable row level security;
create policy "Allow public read" on products for select using (true);
create policy "Allow all insert" on products for insert with check (true);
create policy "Allow all update" on products for update using (true);
create policy "Allow all delete" on products for delete using (true);
`;

export default function SupabaseSettingsModal({
  isOpen,
  onClose,
}: SupabaseSettingsModalProps) {
  const {
    isUsingSupabase,
    supabaseConfig,
    saveCredentials,
    seedSampleData,
    supabaseError,
  } = useProducts();

  const [url, setUrl] = useState(supabaseConfig.url || "https://kafchlvjbbauchwuehyt.supabase.co");
  const [key, setKey] = useState(supabaseConfig.key || "");
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveCredentials(url, key);
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await seedSampleData();
      if (res.success) {
        setSeedMessage(`Successfully seeded ${res.count} luxury creations into Supabase!`);
      } else {
        setSeedMessage(`Seed failed: ${res.error}`);
      }
    } catch (err: any) {
      setSeedMessage(`Error: ${err?.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-[#fafaf8] max-w-xl w-full border border-neutral-300 shadow-2xl relative">
        {/* Header */}
        <div className="px-8 py-6 border-b border-black/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center">
              <Database size={16} />
            </div>
            <div>
              <h2 className="font-serif text-xl tracking-[0.15em] uppercase text-neutral-900 font-medium">
                Supabase Synchronization
              </h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Project: Fashion Store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-black p-1 transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Status Banner */}
          <div
            className={`p-4 border flex items-start space-x-3 ${
              isUsingSupabase
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-amber-50 border-amber-300 text-amber-900"
            }`}
          >
            {isUsingSupabase ? (
              <Check className="text-emerald-700 shrink-0 mt-0.5" size={18} />
            ) : (
              <AlertCircle className="text-amber-700 shrink-0 mt-0.5" size={18} />
            )}
            <div className="text-[12px] leading-relaxed">
              <span className="font-semibold uppercase tracking-wider block mb-0.5">
                {isUsingSupabase
                  ? "Live Supabase Database Connected"
                  : "Local Mode / Waiting for Supabase Anon Key"}
              </span>
              {isUsingSupabase
                ? "All additions, edits, and deletions are syncing directly with your Supabase database table."
                : supabaseError
                ? `Supabase reported: "${supabaseError}". Enter your project's anon key below or check table creation.`
                : "Paste your Supabase anon API key below to link live cloud storage."}
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-700 font-semibold mb-1.5">
                Supabase URL
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://kafchlvjbbauchwuehyt.supabase.co"
                className="w-full bg-white border border-neutral-300 px-4 py-2.5 text-[12px] font-mono text-neutral-900 focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-700 font-semibold mb-1.5">
                Supabase Anon / Public Key
              </label>
              <textarea
                rows={2}
                required
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Paste key starting with eyJhbGciOi..."
                className="w-full bg-white border border-neutral-300 px-4 py-2 text-[11px] font-mono text-neutral-900 focus:border-black outline-none"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Found in Supabase: Project Settings ➔ API ➔ Project API keys ➔ anon public
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-black hover:bg-neutral-800 text-white text-[11px] tracking-[0.2em] uppercase font-semibold py-2.5 px-6 transition-colors disabled:opacity-50"
              >
                {saving ? "Verifying..." : "Save & Connect"}
              </button>

              <button
                type="button"
                onClick={handleSeed}
                disabled={seeding || !key}
                className="border border-black text-black hover:bg-black hover:text-white text-[10px] tracking-[0.2em] uppercase font-semibold py-2.5 px-4 flex items-center space-x-1.5 transition-colors disabled:opacity-40"
              >
                <Sparkles size={13} />
                <span>{seeding ? "Seeding..." : "Seed Mozart Catalog to Supabase"}</span>
              </button>
            </div>
          </form>

          {seedMessage && (
            <div className="p-3 bg-neutral-100 text-[11px] tracking-wide text-neutral-800 border-l-2 border-black">
              {seedMessage}
            </div>
          )}

          {/* SQL Help collapsible */}
          <div className="border-t border-black/[0.08] pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-semibold">
                Table Schema for Supabase SQL Editor
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="text-[10px] uppercase tracking-wider text-neutral-700 hover:text-black flex items-center gap-1"
              >
                {copiedSql ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedSql ? "Copied!" : "Copy SQL"}</span>
              </button>
            </div>
            <pre className="p-3 bg-neutral-900 text-neutral-200 text-[10px] font-mono overflow-x-auto max-h-28">
              {SQL_SCHEMA}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
