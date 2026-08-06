/**
 * Menghubungkan berkas gambar yang sudah ada di folder uploads ke sebuah proyek.
 *
 *   docker compose exec -T app node prisma/attach_images.mjs
 *
 * Dipakai untuk gambar yang dimasukkan lewat berkas langsung (bukan lewat form
 * admin). Berkasnya HARUS sudah berada di UPLOAD_DIR sebelum script dijalankan —
 * script ini hanya membuat barisnya di tabel ProjectImage.
 *
 * Sifatnya idempoten: url yang sudah tercatat dilewati, jadi aman dijalankan ulang.
 */
import { access } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

/** Proyek tujuan dan daftar gambarnya, berurutan. Indeks 0 jadi cover. */
const TARGET = {
  slug: "chiyupals",
  folder: "pictures/chiyupals",
  files: [
    { file: "halaman-utama.png", alt: "Chiyupals — Halaman utama" },
    { file: "katalog.png", alt: "Chiyupals — Katalog produk" },
    { file: "keranjang.png", alt: "Chiyupals — Keranjang belanja" },
    { file: "kustomisasi.png", alt: "Chiyupals — Kustomisasi pesanan" },
  ],
};

async function main() {
  const project = await prisma.project.findUnique({
    where: { slug: TARGET.slug },
    include: { images: true },
  });

  if (!project) {
    console.error(`[attach] Proyek dengan slug "${TARGET.slug}" tidak ditemukan.`);
    process.exitCode = 1;
    return;
  }

  console.log(`[attach] Proyek: ${project.title} (${project.images.length} gambar saat ini)`);

  const sudahAda = new Set(project.images.map((i) => i.url));
  let mulai = project.images.length;
  let ditambah = 0;

  for (const { file, alt } of TARGET.files) {
    const rel = `${TARGET.folder}/${file}`;
    const url = `/api/uploads/${rel}`;

    // Pastikan berkasnya benar-benar ada. Tanpa cek ini, baris DB bisa menunjuk
    // berkas hantu dan galeri menampilkan gambar rusak.
    try {
      await access(path.join(UPLOAD_DIR, rel));
    } catch {
      console.error(`[attach] ! berkas tidak ada, dilewati: ${rel}`);
      continue;
    }

    if (sudahAda.has(url)) {
      console.log(`[attach] = sudah tercatat: ${file}`);
      continue;
    }

    await prisma.projectImage.create({
      data: { projectId: project.id, url, alt, order: mulai++ },
    });
    ditambah++;
    console.log(`[attach] + ${file}  ->  ${url}`);
  }

  const akhir = await prisma.project.findUnique({
    where: { id: project.id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  console.log(`\n[attach] Selesai. ${ditambah} gambar ditambahkan.`);
  console.log(`[attach] Galeri "${akhir.title}" sekarang ${akhir.images.length} gambar:`);
  for (const img of akhir.images) console.log(`  ${String(img.order).padStart(2)}. ${img.url}`);
}

main()
  .catch((e) => {
    console.error("[attach] GAGAL:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
