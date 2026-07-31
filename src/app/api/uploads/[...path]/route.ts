import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextRequest } from "next/server";
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

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;
  const rel = segments.join("/");

  // Cegah path traversal: hasil resolve wajib masih di dalam UPLOAD_DIR.
  const abs = path.resolve(UPLOAD_DIR, rel);
  const root = path.resolve(UPLOAD_DIR);
  if (abs !== root && !abs.startsWith(root + path.sep)) {
    return new Response("Forbidden", { status: 403 });
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
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
