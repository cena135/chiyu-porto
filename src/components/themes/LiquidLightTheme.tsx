"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { KontakBlok, ProfilBlok } from "./ThemeSections";
import type { ThemeProps, ThemeProject } from "./types";

/**
 * Liquid Glass — Light Mode.
 *
 * Kaca di atas latar TERANG jauh lebih sulit daripada di atas latar gelap: di
 * latar gelap, kaca terlihat karena ia lebih terang dari sekitarnya. Di latar
 * terang, trik itu hilang. Yang membuatnya terbaca sebagai kaca di sini adalah
 * tiga hal sekaligus — saturasi tinggi yang menarik warna gradasi di
 * belakangnya, border putih pekat di sisi atas, dan bayangan yang jatuh jauh
 * ke bawah supaya panelnya terasa MELAYANG, bukan menempel.
 *
 * Catatan penting soal `overflow-hidden`: kilau dan pantulan air di dalam
 * kartu adalah lapisan `absolute inset-0` yang jauh lebih besar dari kartunya.
 * Tanpa `overflow-hidden` DI KARTU (bukan di lapisannya), sudut kilaunya
 * menyembul keluar melewati lengkungan kaca dan bingkainya terlihat patah.
 */

function LiquidCard({ project, index }: { project: ThemeProject; index: number }) {
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  // Dua lapisan: kilau tajam yang mengikuti kursor, dan pantulan lebar yang
  // bergerak berlawanan — itu yang memberi kesan permukaan basah, bukan
  // sekadar lingkaran terang yang menempel di kursor.
  const kilau = useMotionTemplate`radial-gradient(260px circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.95), rgb(255 255 255 / 0.25) 45%, transparent 70%)`;
  const pantul = useMotionTemplate`linear-gradient(${gx}deg, rgb(255 255 255 / 0.6), transparent 45%)`;

  function gerak(e: React.MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    gx.set(((e.clientX - r.left) / r.width) * 100);
    gy.set(((e.clientY - r.top) / r.height) * 100);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 110, damping: 18, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      onMouseMove={gerak}
      /* `overflow-hidden` ADA DI SINI, di elemen yang punya lengkungan —
         bukan di lapisan kilaunya. Lapisan anak tidak bisa memotong dirinya
         sendiri mengikuti radius induk. */
      className="liquid-card group relative flex min-h-[15rem] flex-col justify-between overflow-hidden rounded-[1.75rem] p-7"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundImage: kilau }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-70"
        style={{ backgroundImage: pantul }}
      />

      <Link href={`/p/${project.slug}`} className="absolute inset-0 z-10" aria-label={project.title} />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium tracking-[0.2em] text-slate-500">
            {String(index + 1).padStart(2, "0")}
          </span>
          {project.isWip && (
            <span className="rounded-full border border-white/70 bg-white/60 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-slate-600">
              WIP
            </span>
          )}
        </div>
        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
          {project.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {project.description}
        </p>
      </div>

      <div className="relative mt-6 flex items-center gap-2">
        {project.techStack.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/70 bg-white/50 px-2.5 py-1 text-[10px] text-slate-600"
          >
            {t}
          </span>
        ))}
        <span
          aria-hidden
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/60 text-slate-700 transition-all group-hover:bg-white group-hover:text-slate-900"
        >
          →
        </span>
      </div>
    </motion.article>
  );
}

export function LiquidLightTheme({ projects, profil, kontak }: ThemeProps) {
  return (
    <div className="theme-glasslight mx-auto w-full max-w-[86rem] px-6 pb-32 pt-20 sm:px-10">
      <header className="liquid-card relative overflow-hidden rounded-[2rem] p-8 sm:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent"
        />

        <div className="relative">
          <span className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            {profil.status}
          </span>
          <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.02] tracking-tight text-slate-900">
            {profil.judul[0]}
            <br />
            {profil.judul[1]}{" "}
            <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
              {profil.judul[2]}
            </span>
          </h1>

          <ProfilBlok
            profil={profil}
            kelas={{
              foto: "rounded-[1.25rem] ring-1 ring-white/80",
              bio: "text-sm leading-relaxed text-slate-600",
              garis: "border-slate-300",
              nilai: "text-slate-700",
            }}
          />
        </div>
      </header>

      <section className="pt-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <LiquidCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      <KontakBlok
        kontak={kontak}
        kelas={{
          item: "liquid-card group flex items-center gap-4 overflow-hidden rounded-[1.5rem] p-5 text-slate-800",
          ikon: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/60 text-slate-700",
          nilai: "text-slate-900",
        }}
      />
    </div>
  );
}
