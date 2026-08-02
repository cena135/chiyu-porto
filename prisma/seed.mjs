/**
 * Seeder data dummy — dijalankan tanpa dependensi tambahan (node murni + @prisma/client).
 *
 *   docker compose exec app node prisma/seed.mjs           # isi data dummy
 *   docker compose exec app node prisma/seed.mjs --reset   # hapus data dummy saja
 *   docker compose exec app node prisma/seed.mjs --force   # timpa ulang data dummy
 *
 * Semua proyek dummy diberi slug berawalan `demo-` supaya bisa dibersihkan
 * tanpa menyentuh proyek asli. Gambar dibuat sebagai SVG di UPLOAD_DIR,
 * jadi galeri langsung bisa dites tanpa perlu upload manual.
 */
import { mkdir, writeFile, unlink, readdir } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const SEED_PREFIX = "demo-";
const SEED_IMAGE_PREFIX = "seed-";

const PALETTES = [
  ["#22d3ee", "#8b5cf6"],
  ["#f59e0b", "#ec4899"],
  ["#34d399", "#3b82f6"],
  ["#a78bfa", "#f472b6"],
  ["#38bdf8", "#14b8a6"],
  ["#fb7185", "#f59e0b"],
];

/** Screenshot palsu: SVG gradien + label. Ringan, tidak butuh library gambar. */
function makeSvg(title, label, [c1, c2]) {
  const esc = (s) => String(s).replace(/[<>&]/g, (m) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[m]);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="800" fill="#0f1117"/>
  <rect width="1280" height="800" fill="url(#g)" opacity="0.22"/>
  <circle cx="1050" cy="180" r="260" fill="${c1}" opacity="0.18"/>
  <circle cx="220" cy="660" r="220" fill="${c2}" opacity="0.18"/>
  <rect x="80" y="90" width="1120" height="620" rx="28" fill="#ffffff" opacity="0.05"/>
  <rect x="120" y="140" width="380" height="26" rx="13" fill="#ffffff" opacity="0.28"/>
  <rect x="120" y="196" width="640" height="16" rx="8" fill="#ffffff" opacity="0.16"/>
  <rect x="120" y="228" width="520" height="16" rx="8" fill="#ffffff" opacity="0.12"/>
  <text x="120" y="470" font-family="Inter,Segoe UI,sans-serif" font-size="62" font-weight="700" fill="#ffffff" opacity="0.92">${esc(title)}</text>
  <text x="122" y="530" font-family="Inter,Segoe UI,sans-serif" font-size="30" fill="#ffffff" opacity="0.5">${esc(label)}</text>
</svg>`;
}

const PROJECTS = [
  {
    title: "ChiyuPals",
    description:
      "Platform komunitas untuk mencari teman ngobrol dengan pencocokan minat. Dibangun penuh di server rumahan, lengkap dengan backup otomatis tiap 3 jam.",
    content:
      "Studi kasus: bagaimana menjalankan aplikasi komunitas di atas ThinkPad T480 bekas tanpa membuka satu pun port ke internet.",
    techStack: ["Next.js", "PostgreSQL", "Prisma", "Docker", "Cloudflare Tunnel"],
    liveUrl: "https://pals.chiyu.my.id",
    featured: true,
    published: true,
    order: 1,
    shots: ["Halaman beranda", "Pencocokan minat", "Profil pengguna"],
  },
  {
    title: "ChiyuBlooms",
    description:
      "Toko bunga daring dengan katalog musiman, keranjang belanja, dan pelacakan pesanan realtime.",
    techStack: ["React", "Vite", "Express", "PostgreSQL"],
    liveUrl: "https://blooms.chiyu.my.id",
    featured: true,
    published: true,
    order: 2,
    shots: ["Katalog musiman", "Keranjang belanja", "Lacak pesanan", "Panel penjual"],
  },
  {
    title: "T480 Bunker Dashboard",
    description:
      "Panel pemantauan server rumahan: suhu CPU, sisa disk, status container, dan riwayat backup ke flashdisk.",
    techStack: ["Next.js", "Docker API", "Recharts"],
    repoUrl: "https://github.com/cena135/t480-bunker",
    featured: false,
    published: true,
    order: 3,
    shots: ["Ikhtisar sistem", "Status container"],
  },
  {
    title: "ERP Produksi Garmen",
    description:
      "Sistem perencanaan produksi untuk pabrik garmen: pelacakan surat perintah kerja, hasil jahit per operator, dan laporan efisiensi harian.",
    content: "Dipakai harian oleh tim produksi. Fokus pada input cepat di layar kecil dan mode offline.",
    techStack: ["Flask", "PostgreSQL", "HTMX", "Docker"],
    featured: false,
    published: true,
    order: 4,
    shots: ["Papan surat perintah kerja", "Laporan efisiensi", "Input hasil jahit"],
  },
  {
    title: "Arsip Rapat Otomatis",
    description:
      "Pipeline transkripsi rapat memakai faster-whisper, lengkap dengan ringkasan otomatis dan pencarian di seluruh arsip.",
    techStack: ["Python", "faster-whisper", "SQLite"],
    featured: false,
    published: true,
    order: 5,
    shots: ["Daftar transkrip", "Pencarian arsip"],
  },
  {
    title: "Kanvas Piksel Kolaboratif",
    description:
      "Eksperimen kanvas piksel realtime multi-pengguna. Masih setengah jadi — sengaja disimpan sebagai draf.",
    techStack: ["WebSocket", "Canvas API", "Redis"],
    featured: false,
    published: false, // sengaja draf: untuk menguji filter status di admin
    order: 6,
    shots: ["Kanvas realtime"],
  },
];

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Buang semua proyek dummy + file gambarnya. Proyek asli tidak disentuh. */
async function reset() {
  const demos = await prisma.project.findMany({
    where: { slug: { startsWith: SEED_PREFIX } },
    include: { images: true },
  });

  for (const p of demos) {
    for (const img of p.images) {
      const name = path.basename(img.url);
      if (name.startsWith(SEED_IMAGE_PREFIX)) {
        await unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
      }
    }
  }

  const { count } = await prisma.project.deleteMany({
    where: { slug: { startsWith: SEED_PREFIX } },
  });

  // Sapu bersih file seed yang mungkin nyangkut tanpa baris DB.
  const files = await readdir(UPLOAD_DIR).catch(() => []);
  let orphan = 0;
  for (const f of files) {
    if (f.startsWith(SEED_IMAGE_PREFIX)) {
      await unlink(path.join(UPLOAD_DIR, f)).catch(() => {});
      orphan++;
    }
  }

  console.log(`[seed] ${count} proyek dummy dihapus, ${orphan} file gambar dibersihkan.`);
  return count;
}

async function main() {
  const args = process.argv.slice(2);
  const isReset = args.includes("--reset");
  const isForce = args.includes("--force");

  if (isReset) {
    await reset();
    return;
  }

  const existing = await prisma.project.count({ where: { slug: { startsWith: SEED_PREFIX } } });
  if (existing > 0 && !isForce) {
    console.log(
      `[seed] ${existing} proyek dummy sudah ada. Pakai --force untuk menimpa, atau --reset untuk menghapus.`,
    );
    return;
  }
  if (existing > 0 && isForce) await reset();

  await mkdir(UPLOAD_DIR, { recursive: true });

  let totalImages = 0;
  for (const [i, p] of PROJECTS.entries()) {
    const palette = PALETTES[i % PALETTES.length];
    const slug = SEED_PREFIX + slugify(p.title);

    const images = [];
    for (const [n, label] of p.shots.entries()) {
      const name = `${SEED_IMAGE_PREFIX}${slug}-${n + 1}.svg`;
      await writeFile(path.join(UPLOAD_DIR, name), makeSvg(p.title, label, palette), "utf8");
      images.push({ url: `/api/uploads/${name}`, alt: `${p.title} — ${label}`, order: n });
      totalImages++;
    }

    await prisma.project.create({
      data: {
        title: p.title,
        slug,
        description: p.description,
        content: p.content ?? null,
        liveUrl: p.liveUrl ?? null,
        repoUrl: p.repoUrl ?? null,
        techStack: p.techStack,
        featured: p.featured,
        published: p.published,
        order: p.order,
        images: { create: images },
      },
    });

    console.log(`[seed] + ${p.title} (${images.length} gambar)${p.published ? "" : " [draf]"}`);
  }

  console.log(`[seed] Selesai: ${PROJECTS.length} proyek, ${totalImages} gambar.`);
}

main()
  .catch((e) => {
    console.error("[seed] GAGAL:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
