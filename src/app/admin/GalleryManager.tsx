"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectWithImages } from "@/lib/projects";
import { MAX_GALLERY } from "./ProjectForm";

/**
 * Kelola galeri satu proyek tanpa membuka form penuh.
 * Setiap aksi langsung tersimpan ke server (tidak perlu tombol "Simpan").
 */
export function GalleryManager({
  project,
  onChanged,
  onClose,
}: {
  project: ProjectWithImages;
  onChanged: (p: ProjectWithImages) => void;
  onClose: () => void;
}) {
  const [images, setImages] = useState(project.images);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, busy]);

  async function call(init: RequestInit) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/projects/${project.id}/images`, init);
    const json = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setError(json.error ?? `Gagal (${res.status})`);
      return false;
    }
    setImages(json.project.images);
    onChanged(json.project);
    return true;
  }

  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const form = new FormData();
    for (const f of Array.from(list)) form.append("images", f);
    await call({ method: "POST", body: form });
    if (fileRef.current) fileRef.current.value = "";
  }

  async function removeImage(id: string) {
    if (!confirm("Hapus gambar ini dari galeri? File ikut terhapus dari server.")) return;
    await call({
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
  }

  async function reorder(next: typeof images) {
    setImages(next); // optimistis, biar UI tidak terasa lambat
    await call({
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((i) => i.id) }),
    });
  }

  const move = (idx: number, dir: -1 | 1) => {
    const to = idx + dir;
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    [next[idx], next[to]] = [next[to], next[idx]];
    reorder(next);
  };

  const makeCover = (idx: number) => {
    if (idx === 0) return;
    reorder([images[idx], ...images.filter((_, i) => i !== idx)]);
  };

  const full = images.length >= MAX_GALLERY;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Kelola galeri ${project.title}`}
      onClick={() => !busy && onClose()}
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-xl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass modal-panel max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display truncate text-base font-semibold">
              Kelola Screenshot — {project.title}
            </h2>
            <p className="mt-1 text-xs text-mist-400">
              {images.length}/{MAX_GALLERY} gambar · perubahan langsung tersimpan · gambar pertama
              jadi cover
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="glass shrink-0 rounded-full px-4 py-2 text-xs text-mist-200 transition-colors hover:text-ember disabled:opacity-50"
          >
            Tutup ✕
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          multiple
          disabled={busy || full}
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
          onChange={(e) => addFiles(e.target.files)}
          className="w-full cursor-pointer rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-xs text-mist-400 transition-colors file:mr-3 file:rounded-lg file:border-0 file:bg-violet/20 file:px-3 file:py-1.5 file:text-xs file:text-mist-200 hover:border-aurora/40 disabled:cursor-not-allowed disabled:opacity-40"
        />
        {full && (
          <p className="mt-1.5 text-[11px] text-ember">
            Galeri penuh ({MAX_GALLERY}). Hapus salah satu dulu untuk menambah.
          </p>
        )}

        {error && (
          <p className="mt-3 rounded-xl border border-ember/30 bg-ember/10 px-4 py-2.5 text-xs text-ember">
            {error}
          </p>
        )}

        {images.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-white/8 px-6 py-12 text-center text-sm text-mist-400">
            Belum ada screenshot. Tambahkan lewat kotak di atas.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className={`group relative overflow-hidden rounded-xl border transition-opacity ${
                  idx === 0 ? "border-aurora/60" : "border-white/10"
                } ${busy ? "opacity-60" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ""} className="h-28 w-full object-cover" />

                {idx === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-aurora/90 px-2 py-0.5 text-[9px] font-semibold text-ink-950">
                    COVER
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/70 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={busy || idx === 0}
                    title="Geser kiri"
                    className="rounded px-2 text-xs text-mist-200 hover:text-aurora disabled:opacity-25"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => makeCover(idx)}
                    disabled={busy || idx === 0}
                    title="Jadikan cover"
                    className="rounded px-2 text-xs text-mist-200 hover:text-aurora disabled:opacity-25"
                  >
                    ★
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={busy || idx === images.length - 1}
                    title="Geser kanan"
                    className="rounded px-2 text-xs text-mist-200 hover:text-aurora disabled:opacity-25"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => removeImage(img.id)}
                    disabled={busy}
                    title="Hapus gambar"
                    className="rounded px-2 text-xs text-mist-200 hover:text-ember disabled:opacity-25"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
