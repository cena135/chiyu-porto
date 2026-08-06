/**
 * Perbarui deskripsi proyek berdasarkan slug.
 *
 *   docker compose exec -T app node prisma/update_descriptions.mjs
 *
 * Hanya menyentuh kolom `description`. Judul, slug, tech stack, gambar, dan
 * status tampil TIDAK diubah — jadi aman dijalankan kapan saja tanpa merusak
 * URL yang sudah beredar.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DESKRIPSI = {
  chiyupals:
    "Website penjualan Moru doll, dilengkapi katalog, customizer boneka interaktif, keranjang belanja, dan halaman khusus admin.",
  "siruan-sistem-informasi-ruangan-upfk":
    "Website untuk Unit Perencanaan Fisik Kampus Universitas Kristen Petra. Memiliki fitur Audit Trail untuk riwayat data, deteksi aset AI setiap ruangan, dan editor denah.",
  aadk: "Pipeline ETL data warehouse dan dashboard analitik internal untuk jaringan kedai kopi.",
  havanna:
    "Platform manajemen keluhan dan feedback pelanggan (Web & Mobile) untuk memantau operasional multi-cabang.",
  rnkd: "Aplikasi mobile dan panel admin web untuk komunitas olahraga. Memiliki fitur skor live, sistem ranking (MMR), dan leaderboard.",
  snc: "Aplikasi mobile pengumpulan data lapangan yang terintegrasi dengan dashboard admin web untuk memonitor operasional.",
  flat: "Sistem manajemen internal untuk otomatisasi proses peminjaman alat dan pembukuan.",
  allohaus:
    "Aplikasi Point of Sale (POS) dan pelacakan finansial harian untuk fasilitas olahraga.",
};

async function main() {
  let diperbarui = 0;
  let sama = 0;
  const hilang = [];

  for (const [slug, description] of Object.entries(DESKRIPSI)) {
    const project = await prisma.project.findUnique({ where: { slug } });

    if (!project) {
      hilang.push(slug);
      console.error(`[desc] ! slug tidak ditemukan: ${slug}`);
      continue;
    }

    if (project.description === description) {
      sama++;
      console.log(`[desc] = sudah sama : ${project.title}`);
      continue;
    }

    await prisma.project.update({ where: { slug }, data: { description } });
    diperbarui++;
    console.log(`[desc] ~ diperbarui : ${project.title}`);
  }

  console.log(`\n[desc] Selesai. ${diperbarui} diperbarui, ${sama} sudah sama.`);
  if (hilang.length > 0) {
    console.error(`[desc] PERHATIAN: ${hilang.length} slug tidak ada di database: ${hilang.join(", ")}`);
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error("[desc] GAGAL:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
