"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectWithImages } from "@/lib/projects";
import { slugify } from "@/lib/slugify";

export const MAX_GALLERY = 12;

/** Gambar lama (sudah di DB) vs gambar baru (masih File di browser). */
type Slot =
  | { kind: "existing"; id: string; url: string }
  | { kind: "new"; key: string; url: string; file: File };

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-text placeholder:text-text-dim/50 outline-none transition-all focus:border-text/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-text/15";
const label = "block text-xs font-medium tracking-wide text-text-dim mb-1.5";

export function ProjectForm({
  editing,
  onSaved,
  onCancel,
}: {
  editing: ProjectWithImages | null;
  onSaved: (msg: string) => void;
  onCancel: () => void;
}) {
  const [judul, setJudul] = useState(editing?.title ?? "");
  const [slug, setSlug] = useState(editing?.slug ?? "");
  /**
   * Pengisian otomatis berhenti begitu slug disunting manual.
   *
   * Untuk proyek yang SUDAH ADA, dianggap tersunting sejak awal — slug-nya
   * sudah beredar sebagai URL publik, jadi tidak boleh ikut berubah diam-diam
   * hanya karena judulnya dirapikan.
   */
  const [slugManual, setSlugManual] = useState(Boolean(editing));

  const [slots, setSlots] = useState<Slot[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Muat ulang isi form tiap kali proyek yang diedit berganti.
  useEffect(() => {
    setSlots(
      editing ? editing.images.map((img) => ({ kind: "existing", id: img.id, url: img.url })) : [],
    );
    setRemovedIds([]);
    setError(null);
    setJudul(editing?.title ?? "");
    setSlug(editing?.slug ?? "");
    setSlugManual(Boolean(editing));
  }, [editing]);

  // Bebaskan object URL pratinjau saat komponen dilepas.
  useEffect(() => {
    return () => {
      slots.forEach((s) => s.kind === "new" && URL.revokeObjectURL(s.url));
    };
  }, [slots]);

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const room = MAX_GALLERY - slots.length;
    if (room <= 0) {
      setError(`Maksimal ${MAX_GALLERY} gambar per proyek.`);
      return;
    }
    const picked = Array.from(list).slice(0, room);
    if (picked.length < list.length) {
      setError(`Hanya ${room} gambar pertama diambil (batas ${MAX_GALLERY}).`);
    }
    setSlots((prev) => [
      ...prev,
      ...picked.map((file) => ({
        kind: "new" as const,
        key: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        url: URL.createObjectURL(file),
        file,
      })),
    ]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeSlot(idx: number) {
    setSlots((prev) => {
      const s = prev[idx];
      if (s.kind === "existing") setRemovedIds((r) => [...r, s.id]);
      else URL.revokeObjectURL(s.url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function move(idx: number, dir: -1 | 1) {
    setSlots((prev) => {
      const to = idx + dir;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  }

  function makeCover(idx: number) {
    setSlots((prev) => (idx === 0 ? prev : [prev[idx], ...prev.filter((_, i) => i !== idx)]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const form = new FormData(e.currentTarget);
    // Input file asli tidak dipakai — isi & urutan galeri dikirim dari state `slots`.
    form.delete("images");
    for (const s of slots) if (s.kind === "new") form.append("images", s.file);
    form.set(
      "imageOrder",
      slots
        .filter((s): s is Extract<Slot, { kind: "existing" }> => s.kind === "existing")
        .map((s) => s.id)
        .join(","),
    );
    form.set("deleteImageIds", removedIds.join(","));

    const url = editing ? `/api/projects/${editing.id}` : "/api/projects";
    const res = await fetch(url, { method: editing ? "PATCH" : "POST", body: form });
    const json = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? `Gagal menyimpan (${res.status})`);
      return;
    }

    formRef.current?.reset();
    // reset() bawaan browser tidak menyentuh state terkendali — judul dan slug
    // harus dikosongkan sendiri, kalau tidak akan tertinggal di form berikutnya.
    setJudul("");
    setSlug("");
    setSlugManual(false);
    setSlots([]);
    setRemovedIds([]);
    onSaved(editing ? "Proyek diperbarui." : "Proyek ditambahkan.");
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="glass fade-up rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">
          {editing ? `Ubah: ${editing.title}` : "Proyek Baru"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-text-dim transition-colors hover:text-text"
        >
          {editing ? "Batal" : "Tutup"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className={label} htmlFor="title">
              Judul *
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={120}
              value={judul}
              onChange={(e) => {
                setJudul(e.target.value);
                // Ikut mengisi slug HANYA selama belum disunting manual.
                if (!slugManual) setSlug(slugify(e.target.value));
              }}
              placeholder="Sistem ERP Produksi"
              className={field}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label className={`${label} mb-0`} htmlFor="slug">
                Slug URL
              </label>
              {slugManual && (
                <button
                  type="button"
                  onClick={() => {
                    setSlugManual(false);
                    setSlug(slugify(judul));
                  }}
                  className="text-[11px] text-text-dim transition-colors hover:text-text"
                >
                  Samakan dengan judul
                </button>
              )}
            </div>

            <input
              id="slug"
              name="slug"
              maxLength={80}
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              // Dirapikan saat fokus lepas, bukan tiap ketikan — kalau tiap
              // ketikan, strip di ujung langsung dibuang dan kata kedua
              // mustahil diketik.
              onBlur={() => setSlug(slugify(slug))}
              placeholder="otomatis dari judul"
              className={field}
            />

            <p className="mt-1.5 text-[11px] text-text-dim/70">
              Alamat halaman:{" "}
              <span className="text-text/80">
                /p/{slugify(slug || judul) || "…"}
              </span>
              {editing && slugify(slug) !== editing.slug && (
                <span className="ml-2 text-text">
                  · URL berubah, tautan lama tidak lagi berlaku
                </span>
              )}
            </p>
          </div>

          <div>
            <label className={label} htmlFor="description">
              Deskripsi singkat *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              maxLength={600}
              defaultValue={editing?.description ?? ""}
              placeholder="Dashboard produksi realtime untuk pabrik garmen..."
              className={`${field} resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="liveUrl">
                URL Live
              </label>
              <input
                id="liveUrl"
                name="liveUrl"
                type="url"
                defaultValue={editing?.liveUrl ?? ""}
                placeholder="https://..."
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="repoUrl">
                URL Repo
              </label>
              <input
                id="repoUrl"
                name="repoUrl"
                type="url"
                defaultValue={editing?.repoUrl ?? ""}
                placeholder="https://github.com/..."
                className={field}
              />
            </div>
          </div>

          <div>
            <label className={label} htmlFor="techStack">
              Tech stack <span className="text-text-dim/60">(pisahkan dengan koma)</span>
            </label>
            <input
              id="techStack"
              name="techStack"
              defaultValue={editing?.techStack.join(", ") ?? ""}
              placeholder="Next.js, PostgreSQL, Docker"
              className={field}
            />
          </div>

          <div>
            <label className={label} htmlFor="content">
              Catatan panjang <span className="text-text-dim/60">(opsional)</span>
            </label>
            <textarea
              id="content"
              name="content"
              rows={3}
              defaultValue={editing?.content ?? ""}
              className={`${field} resize-y`}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* ---------- Galeri ---------- */}
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label className={`${label} mb-0`} htmlFor="images">
                Galeri screenshot
              </label>
              <span className="text-[11px] text-text-dim/70">
                {slots.length}/{MAX_GALLERY}
              </span>
            </div>

            <input
              ref={fileRef}
              id="images"
              name="images"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
              onChange={(e) => addFiles(e.target.files)}
              className="w-full cursor-pointer rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-xs text-text-dim transition-colors file:mr-3 file:rounded-lg file:border-0 file:bg-text/20 file:px-3 file:py-1.5 file:text-xs file:text-text hover:border-text/40"
            />
            <p className="mt-1.5 text-[11px] text-text-dim/70">
              Pilih beberapa file sekaligus · maks 8 MB/file · gambar{" "}
              <span className="text-text/80">pertama = cover</span>
            </p>

            {slots.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {slots.map((s, idx) => (
                  <div
                    key={s.kind === "existing" ? s.id : s.key}
                    className={`group relative overflow-hidden rounded-xl border ${
                      idx === 0 ? "border-text/60" : "border-white/10"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.url} alt="" className="h-20 w-full object-cover" />

                    {idx === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-text/90 px-1.5 py-0.5 text-[9px] font-semibold text-black">
                        COVER
                      </span>
                    )}
                    {s.kind === "new" && (
                      <span className="absolute right-1 top-1 rounded bg-text/80 px-1.5 py-0.5 text-[9px] text-text">
                        BARU
                      </span>
                    )}

                    <div className="absolute inset-x-0 bottom-0 flex justify-center gap-0.5 bg-black/70 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => move(idx, -1)}
                        disabled={idx === 0}
                        title="Geser kiri"
                        className="rounded px-1.5 text-[11px] text-text hover:text-text disabled:opacity-25"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => makeCover(idx)}
                        disabled={idx === 0}
                        title="Jadikan cover"
                        className="rounded px-1.5 text-[11px] text-text hover:text-text disabled:opacity-25"
                      >
                        ★
                      </button>
                      <button
                        type="button"
                        onClick={() => move(idx, 1)}
                        disabled={idx === slots.length - 1}
                        title="Geser kanan"
                        className="rounded px-1.5 text-[11px] text-text hover:text-text disabled:opacity-25"
                      >
                        ›
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSlot(idx)}
                        title="Hapus gambar"
                        className="rounded px-1.5 text-[11px] text-text hover:text-text"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---------- Status tampil ---------- */}
          <fieldset className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <legend className="px-2 text-xs font-medium text-text-dim">Status tampil</legend>

            <label className="flex cursor-pointer items-start gap-3 py-2">
              <input
                type="checkbox"
                name="published"
                defaultChecked={editing?.published ?? true}
                className="mt-0.5 h-4 w-4 accent-text"
              />
              <span>
                <span className="block text-xs font-medium text-text">Tampilkan di publik</span>
                <span className="block text-[11px] text-text-dim/70">
                  Kalau dimatikan, proyek jadi <b>draf</b>: tersimpan di sini tapi tidak muncul di
                  porto.chiyu.my.id
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 py-2">
              <input
                type="checkbox"
                name="isWip"
                defaultChecked={editing?.isWip ?? false}
                className="mt-0.5 h-4 w-4 accent-text"
              />
              <span>
                <span className="block text-xs font-medium text-text">
                  Work in Progress (masih dikerjakan)
                </span>
                <span className="block text-[11px] text-text-dim/70">
                  Proyek <b>tetap tampil</b> di publik, hanya diberi lencana “WIP”. Beda dengan
                  draf di atas yang menyembunyikannya sama sekali.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 py-2">
              <input
                type="checkbox"
                name="isHidden"
                defaultChecked={editing?.isHidden ?? false}
                className="mt-0.5 h-4 w-4 accent-text"
              />
              <span>
                <span className="block text-xs font-medium text-text">
                  Sembunyikan dari publik (Hide)
                </span>
                <span className="block text-[11px] text-text-dim/70">
                  Untuk proyek <b>internal / NDA</b>: pekerjaannya sudah selesai, tapi tidak boleh
                  tampil di situs. Beda dengan draf di atas yang artinya belum kelar.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 py-2">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={editing?.featured ?? false}
                className="mt-0.5 h-4 w-4 accent-text"
              />
              <span>
                <span className="block text-xs font-medium text-text">Jadikan unggulan</span>
                <span className="block text-[11px] text-text-dim/70">
                  Naik ke urutan paling atas di halaman depan dan dapat badge “Unggulan”
                </span>
              </span>
            </label>

            <div className="mt-3 border-t border-white/8 pt-3">
              <label className={label} htmlFor="order">
                Nomor urut{" "}
                <span className="text-text-dim/60">(kecil = lebih dulu tampil)</span>
              </label>
              <input
                id="order"
                name="order"
                type="number"
                min={0}
                max={9999}
                defaultValue={editing?.order ?? 0}
                className={`${field} max-w-28`}
              />
            </div>
          </fieldset>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-text/30 bg-text/10 px-4 py-2.5 text-xs text-text">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-text px-8 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Proyek"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/10 px-6 py-3 text-sm text-text-dim transition-colors hover:border-white/25 hover:text-text"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
