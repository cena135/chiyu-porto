/**
 * Seeder proyek ASLI (bukan data contoh).
 *
 *   docker compose exec -T app node prisma/seed_projects.mjs         # isi / perbarui
 *   docker compose exec -T app node prisma/seed_projects.mjs --list  # lihat isi DB saja
 *
 * Sifatnya idempoten: memakai upsert berdasarkan `slug`, jadi menjalankannya
 * dua kali TIDAK menggandakan data — yang sudah ada diperbarui isinya.
 *
 * Catatan: proyek-proyek ini sengaja tanpa gambar dan tanpa liveUrl/repoUrl.
 * Baris di halaman depan otomatis memakai panel mesh gradient dengan lencana
 * "Internal", warnanya berbeda tiap baris.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Sama persis dengan slugify() di src/lib/projects.ts supaya slug konsisten. */
function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const PROJECTS = [
  {
    title: "AADK",
    description:
      "Data warehouse ETL pipeline and internal analytics dashboard for a coffee shop chain.",
    techStack: ["Python", "FastAPI", "SQLite", "Vanilla JS"],
  },
  {
    title: "Havanna",
    description:
      "Customer feedback and complaint management platform (Web & Mobile) to streamline multi-branch operations.",
    techStack: ["Python Flask", "PostgreSQL", "Flutter"],
  },
  {
    title: "RNKD",
    description:
      "Cross-platform mobile application and web admin panel for a sports community, featuring live match scoring, matchmaking ranking (MMR), dan leaderboards.",
    techStack: ["React Native (Expo)", "Supabase", "Next.js"],
  },
  {
    title: "SNC",
    description:
      "Mobile application for field data collection, seamlessly integrated with a custom web-based admin dashboard to monitor operations.",
    techStack: ["React", "Next.js", "Flutter"],
  },
  {
    title: "Flat",
    description:
      "Internal management system to automate equipment borrowing processes and simplify bookkeeping.",
    techStack: ["Web", "Flutter"],
  },
  {
    title: "Allohaus",
    description:
      "Point of Sale (POS) and financial tracking application for a padel sports facility to manage daily transactions.",
    techStack: ["Web", "Flutter"],
  },
  {
    title: "SIRUAN (Sistem Informasi Ruangan UPFK)",
    description:
      "Aplikasi pemetaan aset gedung terpusat dengan asisten deteksi AI (YOLOv8) dan sistem Audit Trail otomatis untuk transparansi perubahan data.",
    techStack: ["Python", "YOLOv8", "Laravel", "Filament"],
  },
  {
    title: "Chiyupals",
    description:
      "A full-stack web application featuring secure authentication and automated end-to-end testing.",
    techStack: ["React", "Vite", "Supabase", "Clerk", "Playwright"],
  },
];

/**
 * Slug dari penamaan LAMA yang sudah diganti judulnya.
 *
 * Perlu didaftarkan eksplisit karena mengganti judul menghasilkan slug baru —
 * upsert akan membuat baris baru dan baris lama tetap tertinggal, sehingga
 * daftarnya jadi berlipat. Sengaja daftar tertutup, BUKAN "hapus apa pun yang
 * tidak ada di PROJECTS": aturan sapu bersih akan ikut menghapus proyek yang
 * ditambahkan lewat panel admin.
 */
const SLUG_LAMA = [
  "aadk-analytics",
  "havanna-crm-feedback-system",
  "rnkd-padel-league",
  "snc-internal-app",
  "flat-production-erp",
  "allohaus-pos-finance",
  "skripsi-computer-vision-management",
];

async function list() {
  const rows = await prisma.project.findMany({
    orderBy: { order: "asc" },
    select: { title: true, slug: true, order: true, published: true, isHidden: true },
  });
  if (rows.length === 0) return console.log("[seed] Database kosong.");
  console.log(`[seed] ${rows.length} proyek di database:`);
  for (const r of rows) {
    const tanda = !r.published ? "[draf]" : r.isHidden ? "[disembunyikan]" : "";
    console.log(`  ${String(r.order).padStart(2)}. ${r.title}  (/${r.slug}) ${tanda}`);
  }
}

async function main() {
  if (process.argv.includes("--list")) return list();

  let baru = 0;
  let diperbarui = 0;

  for (const [i, p] of PROJECTS.entries()) {
    const slug = slugify(p.title);
    const data = {
      title: p.title,
      description: p.description,
      techStack: p.techStack,
      order: i + 1,
      published: true,
      isHidden: false,
      featured: false,
    };

    const sudahAda = await prisma.project.findUnique({ where: { slug } });

    await prisma.project.upsert({
      where: { slug },
      create: { ...data, slug },
      update: data,
    });

    if (sudahAda) {
      diperbarui++;
      console.log(`[seed] ~ diperbarui : ${p.title}`);
    } else {
      baru++;
      console.log(`[seed] + ditambahkan: ${p.title}  (/${slug})`);
    }
  }

  // Bersihkan sisa penamaan lama. Gambarnya ikut terhapus lewat onDelete: Cascade.
  const slugBaru = new Set(PROJECTS.map((p) => slugify(p.title)));
  const targetHapus = SLUG_LAMA.filter((s) => !slugBaru.has(s));
  const usang = await prisma.project.findMany({
    where: { slug: { in: targetHapus } },
    select: { slug: true, title: true },
  });

  if (usang.length > 0) {
    await prisma.project.deleteMany({ where: { slug: { in: usang.map((u) => u.slug) } } });
    for (const u of usang) console.log(`[seed] - dihapus (nama lama): ${u.title}  (/${u.slug})`);
  }

  console.log(
    `\n[seed] Selesai. ${baru} baru, ${diperbarui} diperbarui, ${usang.length} dihapus.\n`,
  );
  await list();
}

main()
  .catch((e) => {
    console.error("[seed] GAGAL:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
