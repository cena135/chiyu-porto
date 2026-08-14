"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BentoTheme } from "./BentoTheme";
import { ThemeSwitcher } from "./ThemeSwitcher";
import type { ThemeId, ThemeProps } from "./types";

/**
 * Orkestrator sembilan tema.
 *
 * Kenapa `next/dynamic` dan bukan sembilan impor biasa:
 * kalau kesembilannya diimpor statis, SETIAP pengunjung mengunduh kode
 * kesembilan tema — termasuk three.js dan Vanta yang beratnya ratusan kilobyte —
 * hanya untuk melihat satu tema bawaan. Dengan impor dinamis, tiap tema baru
 * diunduh saat benar-benar dipilih.
 *
 * `ssr: false` di semua tema tambahan bukan sekadar penghematan: beberapa di
 * antaranya menyentuh `window` (Vanta, pengukur kursor), dan merendernya di
 * server hanya akan menghasilkan ketidakcocokan hidrasi.
 *
 * Tema bawaan (Bento) SENGAJA diimpor statis — itu yang dilihat pengunjung
 * sungguhan, dan ia harus ada sejak render pertama di server demi SEO dan
 * kecepatan tampil.
 */

const memuat = (
  <div className="flex min-h-[60vh] items-center justify-center">
    <span className="text-xs uppercase tracking-[0.22em] text-neutral-400">Memuat tema…</span>
  </div>
);

/* Objeknya WAJIB ditulis inline di tiap pemanggilan: kompilator Next membaca
   opsi next/dynamic secara statis saat build dan menolak variabel bersama. */
const NeoTheme = dynamic(() => import("./NeoTheme").then((m) => m.NeoTheme), {
  ssr: false,
  loading: () => memuat,
});
const ClayTheme = dynamic(() => import("./ClayTheme").then((m) => m.ClayTheme), {
  ssr: false,
  loading: () => memuat,
});
const GlassTheme = dynamic(() => import("./GlassTheme").then((m) => m.GlassTheme), {
  ssr: false,
  loading: () => memuat,
});
const MinimalTheme = dynamic(() => import("./MinimalTheme").then((m) => m.MinimalTheme), {
  ssr: false,
  loading: () => memuat,
});
const SpatialTheme = dynamic(() => import("./SpatialTheme").then((m) => m.SpatialTheme), {
  ssr: false,
  loading: () => memuat,
});
const EditorialTheme = dynamic(() => import("./EditorialTheme").then((m) => m.EditorialTheme), {
  ssr: false,
  loading: () => memuat,
});
const CyberpunkTheme = dynamic(() => import("./CyberpunkTheme").then((m) => m.CyberpunkTheme), {
  ssr: false,
  loading: () => memuat,
});
const VantaTheme = dynamic(() => import("./VantaTheme").then((m) => m.VantaTheme), {
  ssr: false,
  loading: () => memuat,
});

const PABRIK: Record<ThemeId, React.ComponentType<ThemeProps>> = {
  bento: BentoTheme,
  neo: NeoTheme,
  clay: ClayTheme,
  glass: GlassTheme,
  minimal: MinimalTheme,
  spatial: SpatialTheme,
  editorial: EditorialTheme,
  cyber: CyberpunkTheme,
  vanta: VantaTheme,
};

export function ThemeShowcase({ projects }: ThemeProps) {
  const [tema, setTema] = useState<ThemeId>("bento");
  const Aktif = PABRIK[tema];

  return (
    <>
      {/* Tiap komponen tema membawa kelas `.theme-*`-nya sendiri, dan seluruh
          gayanya di globals.css dikurung `.theme-*` atau `body:has(.theme-*)`.
          Itulah yang membuat font serif Editorial mustahil bocor ke Cyberpunk:
          begitu komponennya dilepas, kelasnya ikut hilang dan semua aturannya
          berhenti berlaku sekaligus — tidak ada yang perlu dibersihkan manual.

          `mode="wait"` juga menjaga agar tidak pernah ada DUA kelas tema hidup
          bersamaan, yang akan membuat dua latar belakang saling menimpa. */}
      <div>
        {/* mode="wait": tema lama harus selesai memudar SEBELUM yang baru
            masuk. Kalau keduanya hidup bersamaan, dua latar belakang berbeda
            saling menimpa dan pergantiannya terlihat seperti kedipan rusak. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tema}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <Aktif projects={projects} />
          </motion.div>
        </AnimatePresence>
      </div>

      <ThemeSwitcher aktif={tema} onPilih={setTema} />
    </>
  );
}
