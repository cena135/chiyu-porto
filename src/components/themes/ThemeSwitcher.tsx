"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TEMA, type ThemeId } from "./types";

/**
 * Pengalih sembilan tema.
 *
 * Sembilan tombol yang dijejer mendatar akan memakan hampir seluruh lebar layar
 * dan menutupi karya yang justru sedang dinilai. Karena itu bentuknya PANEL
 * yang dilipat: satu tombol kecil, dan daftarnya baru terbuka saat diminta.
 *
 * Warnanya sengaja netral putih-hitam di semua tema. Pengalih yang ikut
 * berganti gaya akan mencampuri kesan tema yang sedang dilihat — dan itu
 * merusak seluruh gunanya perbandingan ini.
 */
export function ThemeSwitcher({
  aktif,
  onPilih,
}: {
  aktif: ThemeId;
  onPilih: (id: ThemeId) => void;
}) {
  const [buka, setBuka] = useState(false);
  const wadah = useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar dan saat Escape. Keduanya dipasang HANYA ketika
  // panel terbuka, jadi tidak ada listener yang menempel seumur halaman.
  useEffect(() => {
    if (!buka) return;

    const klikLuar = (e: MouseEvent) => {
      if (wadah.current && !wadah.current.contains(e.target as Node)) setBuka(false);
    };
    const tekanEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuka(false);
    };

    document.addEventListener("mousedown", klikLuar);
    document.addEventListener("keydown", tekanEsc);
    return () => {
      document.removeEventListener("mousedown", klikLuar);
      document.removeEventListener("keydown", tekanEsc);
    };
  }, [buka]);

  const sekarang = TEMA.find((t) => t.id === aktif) ?? TEMA[0];

  return (
    <div ref={wadah} className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {buka && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            /* max-h + overflow-y: daftar tetap bisa digulir kalau temanya
               bertambah lagi, dan tidak pernah melebihi tinggi layar. */
            className="max-h-[70vh] w-64 overflow-y-auto overscroll-contain rounded-2xl border border-black/10 bg-white p-2 shadow-[0_24px_60px_-16px_rgb(0_0_0/0.45)]"
            // Lenis mengambil alih roda gulir seluruh dokumen; tanpa penanda
            // ini, menggulir DI DALAM panel malah menggulir halaman.
            data-lenis-prevent
          >
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Sembilan Tema
            </p>
            {TEMA.map((t) => {
              const dipilih = t.id === aktif;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onPilih(t.id);
                    setBuka(false);
                  }}
                  aria-current={dipilih}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    dipilih ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className={[
                      "h-2 w-2 shrink-0 rounded-full",
                      dipilih ? "bg-white" : "bg-neutral-300",
                    ].join(" ")}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{t.nama}</span>
                    <span
                      className={[
                        "block truncate text-[11px]",
                        dipilih ? "text-white/60" : "text-neutral-400",
                      ].join(" ")}
                    >
                      {t.catatan}
                    </span>
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        {/* Hint text that disappears after opening the panel once */}
        {!buka && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md"
          >
            <span>✨ Coba ganti tema di sini!</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.div>
        )}

        <motion.button
          type="button"
          onClick={() => setBuka((v) => !v)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          aria-expanded={buka}
          title="Ganti tema tampilan"
          className="flex items-center gap-2.5 rounded-full border border-black/10 bg-white py-2.5 pl-4 pr-3 text-sm font-semibold text-neutral-900 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.45)]"
        >
          <span className="h-2 w-2 rounded-full bg-neutral-900" aria-hidden />
          {sekarang.nama}
          <motion.span
            aria-hidden
            animate={{ rotate: buka ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="text-xs text-neutral-400"
          >
            ▲
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}
