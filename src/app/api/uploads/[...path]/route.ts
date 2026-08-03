import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

/**
 * Cek hak admin tanpa pernah melempar. Rute ini tidak boleh 500 hanya karena
 * konteks Clerk tidak tersedia — kalau ragu, perlakukan sebagai bukan admin.
 */
async function isAdminSafe() {
  try {
    return (await requireAdmin()).ok;
  } catch {
    return false;
  }
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;
  const rel = segments.join("/");

  // Cegah path traversal: hasil resolve wajib masih di dalam UPLOAD_DIR.
  const abs = path.resolve(UPLOAD_DIR, rel);
  const root = path.resolve(UPLOAD_DIR);
  if (abs !== root && !abs.startsWith(root + path.sep)) {
    return new Response("Forbidden", { status: 403 });
  }

  /**
   * Kontrol akses per berkas.
   *
   * Dulu rute ini menyajikan apa pun yang ada di folder uploads, termasuk
   * screenshot proyek draf dan proyek `isHidden` (internal/NDA). Nama berkasnya
   * memang acak, tapi "sulit ditebak" bukan kontrol akses — begitu satu URL
   * ter-share atau terindeks, gambarnya terbuka selamanya.
   *
   * Sekarang: berkas hanya bebas diakses kalau ia milik proyek yang memang layak
   * tampil. Selain itu wajib admin. Berkas yatim (tidak tercatat di DB) juga
   * dianggap tertutup — kalau tidak ada yang merujuknya, publik tidak butuh.
   */
  const url = `/api/uploads/${rel}`;
  const image = await prisma.projectImage.findFirst({
    where: { url },
    select: { project: { select: { published: true, isHidden: true } } },
  });

  const bolehPublik = !!image && image.project.published && !image.project.isHidden;

  if (!bolehPublik && !(await isAdminSafe())) {
    // 404, bukan 403: jangan konfirmasi bahwa berkasnya ada.
    return new Response("Not found", { status: 404 });
  }

  let info;
  try {
    info = await stat(abs);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!info.isFile()) return new Response("Not found", { status: 404 });

  const type = MIME[path.extname(abs).toLowerCase()] ?? "application/octet-stream";
  const stream = Readable.toWeb(createReadStream(abs)) as ReadableStream;

  return new Response(stream, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(info.size),
      /**
       * Sengaja `private`, bukan `public, immutable` seperti sebelumnya.
       * `public` membuat Cloudflare ikut menyimpan salinannya di edge; begitu
       * sebuah proyek disembunyikan, gambarnya masih bisa disajikan edge ke
       * siapa pun walau origin sudah menjawab 404. `private` menutup jalur itu,
       * dan 10 menit membatasi sisa cache di browser masing-masing.
       */
      "Cache-Control": bolehPublik ? "private, max-age=600" : "private, no-store",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
