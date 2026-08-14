import { prisma } from "@/lib/prisma";
import { PROJECT_ORDER, PUBLIC_WHERE, WITH_IMAGES } from "@/lib/projects";

/** Bentuk minimum yang dibutuhkan kartu demo — sengaja TIDAK memakai tipe
 *  Prisma penuh, supaya data cadangan di bawah bisa memenuhinya tanpa harus
 *  memalsukan puluhan kolom yang tidak dipakai satu pun kartu. */
export type DemoProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  isWip: boolean;
  cover: string | null;
};

/** Dipakai kalau database tidak bisa dihubungi (mis. saat build, atau saat
 *  halaman demo dibuka dari mesin lain). Halaman demo gunanya menilai RASA
 *  desain — kalau isinya kosong, tidak ada yang bisa dinilai. */
const CADANGAN: DemoProject[] = [
  {
    id: "d1",
    slug: "chiyupals",
    title: "Chiyupals",
    description:
      "Platform komunitas dengan autentikasi, profil, dan papan aktivitas yang di-hosting sendiri.",
    techStack: ["Next.js", "Prisma", "Clerk"],
    isWip: false,
    cover: null,
  },
  {
    id: "d2",
    slug: "siruan",
    title: "Siruan",
    description: "Sistem pencatatan operasional harian dengan laporan yang bisa diekspor.",
    techStack: ["React", "PostgreSQL", "Docker"],
    isWip: true,
    cover: null,
  },
  {
    id: "d3",
    slug: "porto",
    title: "Portofolio",
    description: "Situs ini sendiri — Next.js di atas ThinkPad T480 yang menyala 24 jam.",
    techStack: ["Next.js", "Tailwind", "Cloudflare"],
    isWip: false,
    cover: null,
  },
  {
    id: "d4",
    slug: "zenith",
    title: "Zenith",
    description: "Aplikasi Android untuk pencatatan cepat, dibungkus jadi APK mandiri.",
    techStack: ["Kotlin", "SQLite"],
    isWip: false,
    cover: null,
  },
  {
    id: "d5",
    slug: "capture",
    title: "Capture",
    description: "Alat tangkap layar beranotasi dengan riwayat lokal.",
    techStack: ["Electron", "TypeScript"],
    isWip: true,
    cover: null,
  },
  {
    id: "d6",
    slug: "blooms",
    title: "Blooms",
    description: "Etalase katalog ringan dengan panel admin dan unggah gambar.",
    techStack: ["Next.js", "Prisma"],
    isWip: false,
    cover: null,
  },
];

export async function getDemoProjects(): Promise<DemoProject[]> {
  try {
    const rows = await prisma.project.findMany({
      where: PUBLIC_WHERE,
      orderBy: PROJECT_ORDER,
      include: WITH_IMAGES,
    });
    if (rows.length === 0) return CADANGAN;

    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      techStack: p.techStack,
      isWip: p.isWip,
      cover: p.images[0]?.url ?? null,
    }));
  } catch {
    return CADANGAN;
  }
}
