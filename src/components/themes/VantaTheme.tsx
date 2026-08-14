"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ThemeProps } from "./types";

/**
 * Vanta 3D — latar WebGL yang bereaksi pada kursor.
 *
 * Tiga hal yang membuat versi ini tidak berbahaya dipasang di beranda:
 *
 * 1. three.js dan Vanta di-`import()` DI DALAM efek, bukan di atas berkas.
 *    Keduanya berukuran ratusan kilobyte; kalau diimpor statis, setiap
 *    pengunjung mengunduhnya walau tidak pernah membuka tema ini.
 * 2. Kalau WebGL tidak tersedia atau Vanta melempar galat, latar jatuh ke
 *    gradasi CSS biasa. Kanvas 3D yang gagal diam-diam meninggalkan halaman
 *    hitam kosong, dan tidak ada satu pun pesan yang menjelaskannya.
 * 3. Pengguna dengan "kurangi animasi" tidak pernah memuatnya sama sekali —
 *    hemat unduhan sekaligus menghormati setelan.
 */
export function VantaTheme({ projects }: ThemeProps) {
  const wadah = useRef<HTMLDivElement>(null);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setGagal(true);
      return;
    }

    let efek: { destroy: () => void } | null = null;
    // Dipasang sebelum await: komponen bisa saja sudah dilepas saat modulnya
    // selesai diunduh, dan tanpa penanda ini kita membuat kanvas WebGL yang
    // tidak akan pernah dihancurkan.
    let hidup = true;

    (async () => {
      try {
        const THREE = await import("three");
        const BIRDS = (await import("vanta/dist/vanta.birds.min")).default;
        if (!hidup || !wadah.current) return;

        efek = BIRDS({
          el: wadah.current,
          THREE,
          mouseControls: true,
          touchControls: false,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          backgroundColor: 0x05060f,
          color1: 0x2563eb,
          color2: 0x7c3aed,
          birdSize: 1.1,
          wingSpan: 24,
          speedLimit: 4,
          separation: 42,
          quantity: 3,
        });
      } catch {
        if (hidup) setGagal(true);
      }
    })();

    return () => {
      hidup = false;
      efek?.destroy();
    };
  }, []);

  return (
    <div className="theme-vanta relative min-h-screen">
      {/* Kanvas WebGL ditanam di sini. `fixed` supaya tetap memenuhi layar saat
          halaman digulir — itu yang membuat kartunya terasa mengambang DI ATAS
          ruang, bukan sekadar di atas gambar yang ikut bergulir. */}
      <div
        ref={wadah}
        aria-hidden
        className="fixed inset-0 -z-10"
        style={
          gagal
            ? { background: "radial-gradient(120% 100% at 20% 0%, #1b2570, #05060f 60%)" }
            : { background: "#05060f" }
        }
      />

      <div className="mx-auto w-full max-w-[86rem] px-6 pb-32 pt-24 sm:px-10">
        <header className="vanta-card max-w-2xl rounded-[2rem] p-8 sm:p-12">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/50">Vanta 3D</span>
          <h1 className="mt-5 text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[1.03] tracking-tight text-white">
            Ruang yang
            <br />
            bergerak sendiri.
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-white/60">
            Latar belakangnya WebGL sungguhan dan mengikuti kursormu. Semua kartu dibuat
            nyaris tembus pandang supaya yang mendominasi adalah ruangnya, bukan kotaknya.
          </p>
          {gagal && (
            <p className="mt-5 text-xs text-white/40">
              Kartu 3D tidak dimuat di perangkat ini — latar diganti gradasi statis.
            </p>
          )}
        </header>

        <section className="pt-14">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 110, damping: 18, delay: i * 0.04 }}
                whileHover={{ y: -5 }}
                className="vanta-card group relative flex min-h-[13rem] flex-col justify-between rounded-[1.5rem] p-6"
              >
                <Link href={`/p/${p.slug}`} className="absolute inset-0 z-10" aria-label={p.title} />
                <div className="relative">
                  <span className="text-[11px] tracking-[0.2em] text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">
                    {p.description}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="relative mt-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/70 transition-all group-hover:border-white/60 group-hover:bg-white/10 group-hover:text-white"
                >
                  →
                </span>
              </motion.article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
