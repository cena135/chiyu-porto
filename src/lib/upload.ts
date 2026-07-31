import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
]);

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export type SaveResult = { ok: true; url: string } | { ok: false; error: string };

/** Simpan file ke UPLOAD_DIR dengan nama acak. Return URL publik yang diserve route handler. */
export async function saveUpload(file: File): Promise<SaveResult> {
  if (!file || file.size === 0) return { ok: false, error: "File kosong." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Ukuran file maksimal 8 MB." };

  const ext = ALLOWED.get(file.type);
  if (!ext) return { ok: false, error: `Tipe file tidak didukung: ${file.type || "unknown"}` };

  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now()}-${randomUUID()}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, name), buf);

  return { ok: true, url: `/api/uploads/${name}` };
}

/** Hapus file lokal kalau URL-nya memang milik kita. Aman kalau file sudah tidak ada. */
export async function deleteUpload(url?: string | null) {
  if (!url || !url.startsWith("/api/uploads/")) return;
  const name = path.basename(url);
  if (!name || name.includes("..") || name.includes("/")) return;
  try {
    await unlink(path.join(UPLOAD_DIR, name));
  } catch {
    /* file sudah hilang -> abaikan */
  }
}
