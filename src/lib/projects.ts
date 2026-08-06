import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { Project, ProjectImage } from "@prisma/client";
import { prisma } from "./prisma";
import { slugify } from "./slugify";

export { slugify };

/**
 * Segarkan seluruh halaman publik setelah admin mengubah data.
 * Wajib ikut menyegarkan /p/[slug] — kalau hanya "/", halaman detail akan
 * menyajikan data basi sampai 60 detik berikutnya.
 */
export function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/p/[slug]", "page");
}

/** Bentuk data yang dipakai di seluruh UI — proyek selalu dibawa bersama galerinya. */
export type ProjectWithImages = Project & { images: ProjectImage[] };

/**
 * Syarat sebuah proyek boleh tampil di publik. SATU sumber kebenaran — dipakai
 * halaman utama, halaman detail, dan API. Jangan tulis ulang filternya di tempat lain.
 * - published: false  -> masih draf, belum selesai
 * - isHidden: true    -> selesai tapi sengaja disembunyikan (internal / NDA)
 */
export const PUBLIC_WHERE = { published: true, isHidden: false } as const;

/** Urutan tampil standar: unggulan dulu, lalu kolom order, lalu terbaru. */
export const PROJECT_ORDER = [
  { featured: "desc" as const },
  { order: "asc" as const },
  { createdAt: "desc" as const },
];

/** Selalu ikutkan galeri, terurut. Gambar pertama = cover. */
export const WITH_IMAGES = {
  images: { orderBy: [{ order: "asc" as const }, { createdAt: "asc" as const }] },
};

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Judul minimal 2 karakter").max(120),
  // Opsional: kalau dikosongkan, slug diturunkan dari judul.
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().min(5, "Deskripsi minimal 5 karakter").max(600),
  content: z.string().trim().max(20000).optional().nullable(),
  liveUrl: z.string().trim().url("URL live tidak valid").optional().or(z.literal("")),
  repoUrl: z.string().trim().url("URL repo tidak valid").optional().or(z.literal("")),
  techStack: z.array(z.string().trim().min(1)).max(20).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  isHidden: z.boolean().default(false),
  isWip: z.boolean().default(false),
  order: z.number().int().min(0).max(9999).default(0),
});
// Catatan: liveUrl, repoUrl, dan content memang sudah opsional sejak awal
// (boleh string kosong), dan gambar tidak pernah diwajibkan — proyek internal
// tanpa tautan maupun screenshot sudah bisa disimpan.

export type ProjectInput = z.infer<typeof projectSchema>;


/** Slug unik; kalau bentrok tambahkan sufiks -2, -3, ... */
export async function uniqueSlug(title: string, ignoreId?: string) {
  const base = slugify(title) || "project";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const found = await prisma.project.findUnique({ where: { slug: candidate } });
    if (!found || found.id === ignoreId) return candidate;
  }
  return `${base}-${Date.now()}`;
}

/** Parse FormData dari form admin menjadi payload tervalidasi. */
export function parseProjectForm(form: FormData) {
  const raw = {
    title: String(form.get("title") ?? ""),
    slug: String(form.get("slug") ?? ""),
    description: String(form.get("description") ?? ""),
    content: (form.get("content") as string) || null,
    liveUrl: String(form.get("liveUrl") ?? ""),
    repoUrl: String(form.get("repoUrl") ?? ""),
    techStack: String(form.get("techStack") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    featured: form.get("featured") === "on" || form.get("featured") === "true",
    published: form.get("published") === "on" || form.get("published") === "true",
    isHidden: form.get("isHidden") === "on" || form.get("isHidden") === "true",
    isWip: form.get("isWip") === "on" || form.get("isWip") === "true",
    order: Number(form.get("order") ?? 0) || 0,
  };
  return projectSchema.safeParse(raw);
}
