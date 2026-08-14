"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { ThemeProps, ThemeProject } from "./types";

/**
 * Spatial UI — kaca sangat buram melayang di atas kedalaman.
 *
 * Kilaunya dibangun dari motion value lewat useMotionTemplate, BUKAN state:
 * posisi kursor berubah puluhan kali per detik, dan setState sebanyak itu akan
 * merender ulang seluruh kartu di tiap gerakan mouse.
 */

function SpatialCard({ project, index }: { project: ThemeProject; index: number }) {
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const kilau = useMotionTemplate`radial-gradient(340px circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.28), transparent 62%)`;

  function gerak(e: React.MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    gx.set(((e.clientX - r.left) / r.width) * 100);
    gy.set(((e.clientY - r.top) / r.height) * 100);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 110, damping: 18, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      onMouseMove={gerak}
      className="spatial-card group relative flex min-h-[15rem] flex-col justify-between rounded-[1.75rem] p-7"
    >
      {/* Kilau di atas permukaan kaca, di bawah teks. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundImage: kilau }}
      />

      <Link href={`/p/${project.slug}`} className="absolute inset-0 z-10" aria-label={project.title} />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium tracking-[0.2em] text-white/50">
            {String(index + 1).padStart(2, "0")}
          </span>
          {project.isWip && (
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/80">
              WIP
            </span>
          )}
        </div>
        <h3 className="mt-5 text-2xl font-medium tracking-tight text-white">{project.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/55">
          {project.description}
        </p>
      </div>

      <div className="relative mt-6 flex items-center gap-2">
        {project.techStack.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-white/60"
          >
            {t}
          </span>
        ))}
        <span
          aria-hidden
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all group-hover:border-white/50 group-hover:bg-white/10 group-hover:text-white"
        >
          →
        </span>
      </div>
    </motion.article>
  );
}

export function SpatialTheme({ projects }: ThemeProps) {
  return (
    <div className="theme-spatial mx-auto w-full max-w-[86rem] px-6 pb-32 pt-20 sm:px-10">
      <header className="spatial-card rounded-[2rem] p-8 sm:p-14">
        <span className="text-[11px] uppercase tracking-[0.22em] text-white/45">Spatial UI</span>
        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-medium leading-[1.02] tracking-tight text-white">
          Antarmuka yang
          <br />
          melayang.
        </h1>
        <p className="mt-7 max-w-lg text-[15px] leading-relaxed text-white/55">
          Panel kaca tebal di atas kedalaman gelap. Gerakkan kursor di atas kartu — kilau
          cahayanya mengikuti, seolah permukaannya benar-benar memantulkan sesuatu.
        </p>
      </header>

      <section className="pt-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <SpatialCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
