"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { KontakBlok, ProfilBlok } from "./ThemeSections";
import type { ThemeProps } from "./types";

/**
 * Vanta 3D — latar WebGL Birds yang bereaksi pada kursor.
 *
 * KENAPA VERSI SEBELUMNYA SELALU JATUH KE FALLBACK — dua sebab, keduanya ada
 * di dalam bundel Vanta dan tidak terlihat dari luar:
 *
 * 1. Di baris pertamanya, `vanta.birds.min.js` menjalankan
 *    `let s = window.THREE || {}` — three.js diambil dari GLOBAL, sekali, PADA
 *    SAAT MODULNYA DIEVALUASI. Opsi `THREE` yang kita oper ke pemanggilan efek
 *    tidak pernah dipakai untuk ini. Kalau `window.THREE` belum ada saat
 *    modulnya diimpor, Vanta mencetak "No THREE defined on window", melewati
 *    pembuatan scene, lalu mengecat `el.style.background` dengan warna
 *    `backgroundColor` — persis "lampu sticky di belakang" yang CEO lihat.
 *    Karena itu `window.THREE` HARUS diisi SEBELUM baris impor Vanta.
 *
 * 2. Bundelnya UMD dan mendaftarkan efeknya ke `window.VANTA.BIRDS`. Nilai
 *    yang dikembalikan modulnya bukan fungsi efek itu, jadi memanggil
 *    `(await import(...)).default(...)` melempar TypeError.
 */

type EfekVanta = { destroy: () => void };
type PembuatEfek = (opsi: Record<string, unknown>) => EfekVanta;

export function VantaTheme({ projects, profil, kontak }: ThemeProps) {
  const wadah = useRef<HTMLDivElement>(null);
  const [gagal, setGagal] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setGagal("Dimatikan karena setelan “kurangi animasi” aktif.");
      return;
    }

    let efek: EfekVanta | null = null;
    // Dipasang sebelum await: komponen bisa saja sudah dilepas saat modulnya
    // selesai diunduh, dan tanpa penanda ini kita membuat kanvas WebGL yang
    // tidak akan pernah dihancurkan.
    let hidup = true;

    (async () => {
      try {
        const THREE = await import("three");
        (window as unknown as { THREE?: unknown }).THREE = THREE;

        const modul = await import("vanta/dist/vanta.birds.min");
        if (!hidup || !wadah.current) return;

        // Tiga jalan, berurutan dari yang paling bisa diandalkan. Registri
        // global adalah cara resmi Vanta mengekspos efeknya.
        const global = window as unknown as { VANTA?: Record<string, PembuatEfek> };
        const bawaan = modul as unknown as { default?: unknown };
        const BIRDS =
          global.VANTA?.BIRDS ??
          (typeof bawaan.default === "function" ? (bawaan.default as PembuatEfek) : undefined);

        if (typeof BIRDS !== "function") {
          throw new Error("VANTA.BIRDS tidak ditemukan setelah modul dimuat");
        }

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
          birdSize: 1.2,
          wingSpan: 26,
          speedLimit: 4.5,
          separation: 40,
          quantity: 3,
        });
      } catch (e) {
        // Pesannya ditampilkan, bukan ditelan. Kanvas 3D yang gagal diam-diam
        // meninggalkan halaman gelap kosong dan tidak ada satu pun petunjuk
        // kenapa — persis yang terjadi pada versi sebelumnya.
        if (hidup) setGagal(e instanceof Error ? e.message : "WebGL tidak tersedia");
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
          ruang, bukan di atas gambar yang ikut bergulir. */}
      <div
        ref={wadah}
        aria-hidden
        className="fixed inset-0 z-0"
        style={
          gagal
            ? { background: "radial-gradient(120% 100% at 20% 0%, #1b2570, #05060f 60%)" }
            : undefined
        }
      />

      {/* z-10: seluruh isi halaman harus berada DI ATAS kanvas. */}
      <div className="relative z-10 mx-auto w-full max-w-[86rem] px-6 pb-32 pt-24 sm:px-10">
        <header className="vanta-card max-w-3xl rounded-[2rem] p-8 sm:p-12">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/50">
            {profil.status}
          </span>
          <h1 className="mt-5 text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[1.03] tracking-tight text-white">
            {profil.judul[0]} {profil.judul[1]}
            <br />
            {profil.judul[2]}
          </h1>

          <ProfilBlok
            profil={profil}
            kelas={{
              foto: "rounded-full ring-2 ring-white/25",
              bio: "text-sm leading-relaxed text-white/60",
              garis: "border-white/20",
              nilai: "text-white/85",
            }}
          />

          {gagal && (
            <p className="mt-6 text-xs text-white/40">Latar 3D tidak aktif — {gagal}</p>
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
                className="vanta-card group relative flex min-h-[13rem] flex-col justify-between overflow-hidden rounded-[1.5rem] p-6"
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

        <KontakBlok
          kontak={kontak}
          kelas={{
            item: "vanta-card group flex items-center gap-4 overflow-hidden rounded-[1.5rem] p-5 text-white",
            ikon: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white/80",
            nilai: "text-white",
          }}
        />
      </div>
    </div>
  );
}
