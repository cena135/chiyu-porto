"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { ProjectWithImages } from "@/lib/projects";
import { ProjectForm } from "./ProjectForm";
import { GalleryManager } from "./GalleryManager";

type Tab = "list" | "form";
type StatusFilter = "semua" | "publik" | "draf" | "tersembunyi";
type SortBy = "urutan" | "terbaru" | "judul";
type Toast = { kind: "ok" | "err"; msg: string } | null;

export function AdminDashboard({ initialProjects }: { initialProjects: ProjectWithImages[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [tab, setTab] = useState<Tab>("list");
  const [editing, setEditing] = useState<ProjectWithImages | null>(null);
  const [gallery, setGallery] = useState<ProjectWithImages | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("semua");
  const [sort, setSort] = useState<SortBy>("urutan");

  const [, startTransition] = useTransition();

  useEffect(() => setProjects(initialProjects), [initialProjects]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const stats = useMemo(
    () => ({
      total: projects.length,
      // "Tampil publik" harus lolos KEDUA syarat, sama seperti PUBLIC_WHERE di server.
      publik: projects.filter((p) => p.published && !p.isHidden).length,
      draf: projects.filter((p) => !p.published).length,
      tersembunyi: projects.filter((p) => p.isHidden).length,
      unggulan: projects.filter((p) => p.featured).length,
      gambar: projects.reduce((n, p) => n + p.images.length, 0),
      tanpaGambar: projects.filter((p) => p.images.length === 0).length,
    }),
    [projects],
  );

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = projects.filter((p) => {
      if (status === "publik" && (!p.published || p.isHidden)) return false;
      if (status === "draf" && p.published) return false;
      if (status === "tersembunyi" && !p.isHidden) return false;
      if (!term) return true;
      return (
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.techStack.some((t) => t.toLowerCase().includes(term))
      );
    });

    out = [...out].sort((a, b) => {
      if (sort === "judul") return a.title.localeCompare(b.title);
      if (sort === "terbaru") return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.order !== b.order) return a.order - b.order;
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });

    return out;
  }, [projects, q, status, sort]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  /** Ganti satu proyek di state lokal supaya UI langsung berubah tanpa menunggu refresh. */
  function patchLocal(p: ProjectWithImages) {
    setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    if (gallery?.id === p.id) setGallery(p);
  }

  async function toggle(
    p: ProjectWithImages,
    patch: { published?: boolean; featured?: boolean; isHidden?: boolean },
  ) {
    setBusyId(p.id);
    const res = await fetch(`/api/projects/${p.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json().catch(() => ({}));
    setBusyId(null);

    if (!res.ok) {
      setToast({ kind: "err", msg: json.error ?? "Gagal mengubah status." });
      return;
    }
    patchLocal(json.project);
    const what =
      patch.published !== undefined
        ? patch.published
          ? "Ditampilkan di publik."
          : "Disimpan sebagai draf."
        : patch.isHidden !== undefined
          ? patch.isHidden
            ? "Disembunyikan dari publik (internal/NDA)."
            : "Ditampilkan kembali ke publik."
          : patch.featured
            ? "Ditandai unggulan."
            : "Dilepas dari unggulan.";
    setToast({ kind: "ok", msg: what });
    refresh();
  }

  async function remove(p: ProjectWithImages) {
    if (
      !confirm(
        `Hapus proyek "${p.title}"?\n\n${p.images.length} gambar ikut terhapus dari server. Tindakan ini permanen.`,
      )
    )
      return;

    setBusyId(p.id);
    const res = await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
    setBusyId(null);

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setToast({ kind: "err", msg: json.error ?? "Gagal menghapus." });
      return;
    }
    setProjects((prev) => prev.filter((x) => x.id !== p.id));
    if (editing?.id === p.id) {
      setEditing(null);
      setTab("list");
    }
    setToast({ kind: "ok", msg: `"${p.title}" dihapus.` });
    refresh();
  }

  function startEdit(p: ProjectWithImages) {
    setEditing(p);
    setTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startCreate() {
    setEditing(null);
    setTab("form");
  }

  const tabBtn = (t: Tab) =>
    `rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
      tab === t
        ? "bg-white/10 text-mist-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
        : "text-mist-400 hover:text-mist-200"
    }`;

  return (
    <div className="mt-6 space-y-6">
      {/* ---------- Statistik ---------- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total proyek", value: stats.total, tone: "text-mist-200" },
          { label: "Tampil publik", value: stats.publik, tone: "text-aurora" },
          { label: "Draf", value: stats.draf, tone: "text-ember" },
          { label: "Disembunyikan", value: stats.tersembunyi, tone: "text-ember" },
          { label: "Unggulan", value: stats.unggulan, tone: "text-violet" },
        ].map((s) => (
          <div key={s.label} className="glass reveal rounded-2xl px-4 py-3">
            <p className={`font-display text-2xl font-semibold ${s.tone}`}>{s.value}</p>
            <p className="mt-0.5 text-[11px] text-mist-400">{s.label}</p>
          </div>
        ))}
      </div>

      {stats.tanpaGambar > 0 && (
        <p className="rounded-xl border border-ember/25 bg-ember/8 px-4 py-2.5 text-xs text-ember">
          {stats.tanpaGambar} proyek belum punya screenshot — kartunya tampil polos di halaman
          depan.
        </p>
      )}

      {/* ---------- Tab ---------- */}
      <div className="glass flex items-center justify-between gap-3 rounded-2xl p-2">
        <div className="flex gap-1">
          <button onClick={() => setTab("list")} className={tabBtn("list")}>
            Daftar Proyek
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
              {projects.length}
            </span>
          </button>
          <button onClick={() => setTab("form")} className={tabBtn("form")}>
            {editing ? "Ubah Proyek" : "Tambah Baru"}
          </button>
        </div>

        {tab === "list" && (
          <button
            onClick={startCreate}
            className="btn-glow rounded-xl px-5 py-2.5 text-sm font-semibold text-ink-950"
          >
            + Proyek Baru
          </button>
        )}
      </div>

      {toast && (
        <p
          className={`pop-in rounded-xl border px-4 py-2.5 text-xs ${
            toast.kind === "ok"
              ? "border-aurora/30 bg-aurora/10 text-aurora"
              : "border-ember/30 bg-ember/10 text-ember"
          }`}
        >
          {toast.msg}
        </p>
      )}

      {/* ---------- Isi tab ---------- */}
      {/* Render kondisional sudah memasang ulang isi tab, jadi animasi fade-up
          terpicu sendiri tiap berpindah — tidak perlu key khusus. */}
      {tab === "form" ? (
        <ProjectForm
          editing={editing}
          onSaved={(msg) => {
            setToast({ kind: "ok", msg });
            setEditing(null);
            setTab("list");
            refresh();
          }}
          onCancel={() => {
            setEditing(null);
            setTab("list");
          }}
        />
      ) : (
        <>
          {/* Pencarian + filter */}
          <div className="glass fade-up flex flex-wrap items-center gap-3 rounded-2xl p-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari judul, deskripsi, atau tech stack..."
              className="min-w-52 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-mist-200 placeholder:text-mist-400/50 outline-none transition-all focus:border-aurora/60 focus:ring-2 focus:ring-aurora/15"
            />

            <div className="flex gap-1 rounded-xl border border-white/10 p-1">
              {(["semua", "publik", "draf", "tersembunyi"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs capitalize transition-colors ${
                    status === s ? "bg-white/10 text-mist-200" : "text-mist-400 hover:text-mist-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortBy)}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-mist-200 outline-none focus:border-aurora/60"
            >
              <option value="urutan">Urutan tampil</option>
              <option value="terbaru">Terbaru dibuat</option>
              <option value="judul">Judul A-Z</option>
            </select>
          </div>

          {shown.length === 0 ? (
            <div className="glass rounded-3xl px-8 py-16 text-center">
              <p className="text-sm text-mist-200">
                {projects.length === 0
                  ? "Belum ada proyek sama sekali."
                  : "Tidak ada proyek yang cocok dengan filter."}
              </p>
              <p className="mt-2 text-xs text-mist-400">
                {projects.length === 0 ? (
                  <>
                    Tambahkan lewat tombol “+ Proyek Baru”, atau isi data dummy dengan{" "}
                    <code className="text-aurora/80">docker compose exec app node prisma/seed.mjs</code>
                  </>
                ) : (
                  "Coba ubah kata kunci atau filter status."
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {shown.map((p, i) => (
                <article
                  key={p.id}
                  className={`glass reveal flex flex-wrap items-center gap-4 rounded-2xl p-4 transition-opacity ${
                    busyId === p.id ? "opacity-50" : ""
                  }`}
                  style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
                >
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-800">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-mist-400/50">
                        no image
                      </div>
                    )}
                    {p.images.length > 1 && (
                      <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 text-[9px] text-mist-200 backdrop-blur-sm">
                        +{p.images.length - 1}
                      </span>
                    )}
                  </div>

                  <div className="min-w-48 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-mist-200">{p.title}</h3>
                      {p.featured && (
                        <span className="rounded-full bg-violet/20 px-2 py-0.5 text-[10px] text-violet">
                          unggulan
                        </span>
                      )}
                      {p.isHidden && (
                        <span className="rounded-full bg-ember/20 px-2 py-0.5 text-[10px] text-ember">
                          disembunyikan
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          p.published && !p.isHidden
                            ? "bg-aurora/15 text-aurora"
                            : "bg-ember/15 text-ember"
                        }`}
                      >
                        {!p.published ? "draf" : p.isHidden ? "internal" : "publik"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-mist-400">{p.description}</p>
                    <p className="mt-1 text-[11px] text-mist-400/60">
                      /{p.slug} · urutan {p.order} · {p.images.length} gambar
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggle(p, { published: !p.published })}
                      disabled={busyId === p.id}
                      title={p.published ? "Sembunyikan dari publik" : "Tampilkan di publik"}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist-400 transition-all hover:border-aurora/50 hover:text-aurora disabled:opacity-40"
                    >
                      {p.published ? "Jadikan draf" : "Terbitkan"}
                    </button>
                    <button
                      onClick={() => toggle(p, { isHidden: !p.isHidden })}
                      disabled={busyId === p.id}
                      title={
                        p.isHidden
                          ? "Tampilkan kembali ke publik"
                          : "Sembunyikan (proyek internal / NDA)"
                      }
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist-400 transition-all hover:border-ember/50 hover:text-ember disabled:opacity-40"
                    >
                      {p.isHidden ? "Tampilkan" : "Sembunyikan"}
                    </button>
                    <button
                      onClick={() => toggle(p, { featured: !p.featured })}
                      disabled={busyId === p.id}
                      title="Tandai / lepas unggulan"
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist-400 transition-all hover:border-violet/50 hover:text-violet disabled:opacity-40"
                    >
                      {p.featured ? "★ Unggulan" : "☆ Unggulan"}
                    </button>
                    <button
                      onClick={() => setGallery(p)}
                      disabled={busyId === p.id}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist-200 transition-all hover:border-aurora/50 hover:text-aurora disabled:opacity-40"
                    >
                      Kelola Gambar
                    </button>
                    <button
                      onClick={() => startEdit(p)}
                      disabled={busyId === p.id}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist-200 transition-all hover:border-aurora/50 hover:text-aurora disabled:opacity-40"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(p)}
                      disabled={busyId === p.id}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist-400 transition-all hover:border-ember/50 hover:text-ember disabled:opacity-40"
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {gallery && (
        <GalleryManager
          project={gallery}
          onChanged={patchLocal}
          onClose={() => {
            setGallery(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
