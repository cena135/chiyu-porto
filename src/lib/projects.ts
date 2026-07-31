import { z } from "zod";
import { prisma } from "./prisma";

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Judul minimal 2 karakter").max(120),
  description: z.string().trim().min(5, "Deskripsi minimal 5 karakter").max(600),
  content: z.string().trim().max(20000).optional().nullable(),
  liveUrl: z.string().trim().url("URL live tidak valid").optional().or(z.literal("")),
  repoUrl: z.string().trim().url("URL repo tidak valid").optional().or(z.literal("")),
  techStack: z.array(z.string().trim().min(1)).max(20).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().min(0).max(9999).default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

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
    order: Number(form.get("order") ?? 0) || 0,
  };
  return projectSchema.safeParse(raw);
}
