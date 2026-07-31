"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Project } from "@prisma/client";

type Status = { kind: "idle" } | { kind: "error"; msg: string } | { kind: "ok"; msg: string };

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-mist-200 placeholder:text-mist-400/50 outline-none transition-all focus:border-aurora/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-aurora/15";
const label = "block text-xs font-medium tracking-wide text-mist-400 mb-1.5";

export function AdminDashboard({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => setProjects(initialProjects), [initialProjects]);

  useEffect(() => {
    if (status.kind === "ok") {
      const t = setTimeout(() => setStatus({ kind: "idle" }), 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  function resetForm() {
    formRef.current?.reset();
    setEditing(null);
    setPreview(null);
    setRemoveImage(false);
  }

  function startEdit(p: Project) {
    setEditing(p);
    setPreview(p.imageUrl);
    setRemoveImage(false);
    setStatus({ kind: "idle" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (removeImage) form.set("removeImage", "true");

    setStatus({ kind: "idle" });
    const url = editing ? `/api/projects/${editing.id}` : "/api/projects";
    const res = await fetch(url, { method: editing ? "PATCH" : "POST", body: form });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus({ kind: "error", msg: json.error ?? `Gagal menyimpan (${res.status})` });
      return;
    }

    setStatus({ kind: "ok", msg: editing ? "Proyek diperbarui." : "Proyek ditambahkan." });
    resetForm();
    startTransition(() => router.refresh());
  }

  async function handleDelete(p: Project) {
    if (!confirm(`Hapus proyek "${p.title}"? Tindakan ini permanen.`)) return;
    const res = await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setStatus({ kind: "error", msg: json.error ?? "Gagal menghapus." });
      return;
    }
    if (editing?.id === p.id) resetForm();
    setStatus({ kind: "ok", msg: "Proyek dihapus." });
    startTransition(() => router.refresh());
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* ---------- Form ---------- */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="glass reveal h-fit rounded-3xl p-6 lg:sticky lg:top-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">
            {editing ? "Ubah Proyek" : "Proyek Baru"}
          </h2>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-mist-400 transition-colors hover:text-ember"
            >
              Batal
            </button>
          )}
        </div>

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
              defaultValue={editing?.title ?? ""}
              placeholder="Sistem ERP Produksi"
              className={field}
            />
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

          <div>
            <label className={label} htmlFor="image">
              Gambar proyek
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setPreview(URL.createObjectURL(f));
                  setRemoveImage(false);
                }
              }}
              className="w-full cursor-pointer rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-xs text-mist-400 transition-colors file:mr-3 file:rounded-lg file:border-0 file:bg-violet/20 file:px-3 file:py-1.5 file:text-xs file:text-mist-200 hover:border-aurora/40"
            />
            <p className="mt-1.5 text-[11px] text-mist-400/70">
              JPG / PNG / WEBP / AVIF / SVG · maks 8 MB · disimpan di volume{" "}
              <code className="text-aurora/80">uploads/</code>
            </p>

            {preview && !removeImage && (
              <div className="relative mt-3 overflow-hidden rounded-xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Pratinjau" className="h-36 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setRemoveImage(true);
                  }}
                  className="absolute right-2 top-2 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] text-mist-200 backdrop-blur-md transition-colors hover:bg-ember/70 hover:text-ink-950"
                >
                  Hapus
                </button>
              </div>
            )}
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
              Tech stack <span className="text-mist-400/60">(pisahkan dengan koma)</span>
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
              Catatan panjang <span className="text-mist-400/60">(opsional)</span>
            </label>
            <textarea
              id="content"
              name="content"
              rows={4}
              defaultValue={editing?.content ?? ""}
              className={`${field} resize-y`}
            />
          </div>

          <div className="grid grid-cols-3 items-end gap-3">
            <div>
              <label className={label} htmlFor="order">
                Urutan
              </label>
              <input
                id="order"
                name="order"
                type="number"
                min={0}
                max={9999}
                defaultValue={editing?.order ?? 0}
                className={field}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 pb-3 text-xs text-mist-400">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={editing?.featured ?? false}
                className="h-4 w-4 accent-violet"
              />
              Unggulan
            </label>
            <label className="flex cursor-pointer items-center gap-2 pb-3 text-xs text-mist-400">
              <input
                type="checkbox"
                name="published"
                defaultChecked={editing?.published ?? true}
                className="h-4 w-4 accent-aurora"
              />
              Publikasi
            </label>
          </div>
        </div>

        {status.kind === "error" && (
          <p className="mt-4 rounded-xl border border-ember/30 bg-ember/10 px-4 py-2.5 text-xs text-ember">
            {status.msg}
          </p>
        )}
        {status.kind === "ok" && (
          <p className="mt-4 rounded-xl border border-aurora/30 bg-aurora/10 px-4 py-2.5 text-xs text-aurora">
            {status.msg}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn-glow mt-6 w-full rounded-xl py-3 text-sm font-semibold text-ink-950 disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Proyek"}
        </button>
      </form>

      {/* ---------- Daftar ---------- */}
      <section className="space-y-3">
        {projects.length === 0 && (
          <div className="glass rounded-3xl px-8 py-16 text-center text-sm text-mist-400">
            Belum ada proyek. Tambahkan lewat form di samping.
          </div>
        )}

        {projects.map((p, i) => (
          <article
            key={p.id}
            className={`glass reveal flex items-center gap-4 rounded-2xl p-4 transition-colors ${
              editing?.id === p.id ? "border-aurora/50" : ""
            }`}
            style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
          >
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-800">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-mist-400/50">
                  no image
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-mist-200">{p.title}</h3>
                {p.featured && (
                  <span className="rounded-full bg-violet/20 px-2 py-0.5 text-[10px] text-violet">
                    unggulan
                  </span>
                )}
                {!p.published && (
                  <span className="rounded-full bg-ember/15 px-2 py-0.5 text-[10px] text-ember">
                    draft
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-mist-400">{p.description}</p>
              <p className="mt-1 text-[11px] text-mist-400/60">
                /{p.slug} · urutan {p.order}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => startEdit(p)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist-200 transition-all hover:border-aurora/50 hover:text-aurora"
              >
                Ubah
              </button>
              <button
                onClick={() => handleDelete(p)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist-400 transition-all hover:border-ember/50 hover:text-ember"
              >
                Hapus
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
