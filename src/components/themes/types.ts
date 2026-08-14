import type { KontakItem, Profil } from "@/lib/site-data";

/**
 * Bentuk data yang dipakai SEMUA tema.
 *
 * Sengaja bukan tipe Prisma: sembilan komponen tema tidak perlu tahu apa pun
 * tentang skema database, dan ini yang membuat tiap tema bisa diuji dengan data
 * karangan tanpa harus memalsukan puluhan kolom yang tak satu pun dipakai.
 */
export type ThemeProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  isWip: boolean;
  cover: string | null;
};

/** Semua tema menerima paket yang SAMA. Datanya diambil sekali di Server
 *  Component induk lalu dioper turun — tidak ada tema yang mengambil datanya
 *  sendiri, dan tidak ada satu pun yang menampilkan isian palsu. */
export type ThemeProps = {
  projects: ThemeProject[];
  profil: Profil;
  kontak: KontakItem[];
};

/** Id tema — dipakai sebagai kunci di switcher, state, dan nama kelas CSS. */
export type ThemeId =
  | "bento"
  | "neo"
  | "clay"
  | "glass"
  | "minimal"
  | "glasslight"
  | "editorial"
  | "cyber"
  | "vanta";

export const TEMA: { id: ThemeId; nama: string; catatan: string }[] = [
  { id: "bento", nama: "Bento", catatan: "Grid asimetris, terang" },
  { id: "neo", nama: "Neo Brutal", catatan: "Garis tebal, bayangan padat" },
  { id: "clay", nama: "Clay 3D", catatan: "Pastel empuk" },
  { id: "glass", nama: "Liquid Glass", catatan: "Kaca di atas aurora" },
  { id: "minimal", nama: "Minimal", catatan: "Ruang kosong ekstrem" },
  { id: "glasslight", nama: "Liquid Light", catatan: "Kaca bening, latar terang" },
  { id: "editorial", nama: "Editorial", catatan: "Serif, majalah" },
  { id: "cyber", nama: "Cyberpunk", catatan: "Neon, monospace" },
  { id: "vanta", nama: "Vanta 3D", catatan: "Latar WebGL interaktif" },
];
