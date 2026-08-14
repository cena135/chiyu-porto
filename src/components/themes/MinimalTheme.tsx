"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroKananBlok, KontakBlok, ProfilBlok } from "./ThemeSections";
import type { ThemeProps, ThemeProject } from "./types";

/**
 * Kartu proyek versi Apple Minimalism.
 *
 * Tidak ada kartu, sebenarnya — hanya baris. Tanpa border, tanpa bayangan,
 * tanpa latar; pemisahnya cuma satu garis rambut dan jarak yang lapang.
 *
 * Gerakannya memakai `tween` berdurasi panjang, BUKAN pegas: pegas selalu
 * meninggalkan sisa pantulan sekecil apa pun, dan satu pantulan saja sudah
 * cukup merusak ketenangan yang jadi seluruh isi gaya ini.
 */

const halus = { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const };

function MinimalCard({ project, index }: { project: ThemeProject; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ ...halus, delay: index * 0.08 }}
      whileHover="hover"
      className="group relative border-t border-black/[0.08]"
    >
      <Link href={`/p/${project.slug}`} className="absolute inset-0 z-10" aria-label={project.title} />

      <div className="relative flex flex-col gap-6 py-14 sm:flex-row sm:items-baseline sm:gap-16">
        <motion.span
          className="eyebrow shrink-0 sm:w-24"
          variants={{ hover: { opacity: 1 } }}
          initial={{ opacity: 0.55 }}
          transition={halus}
        >
          {String(index + 1).padStart(2, "0")}
        </motion.span>

        <div className="min-w-0 flex-1">
          <motion.h3
            className="display text-[clamp(1.75rem,4vw,3rem)]"
            variants={{ hover: { x: 12 } }}
            transition={halus}
          >
            {project.title}
          </motion.h3>
          <motion.p
            className="mt-5 max-w-xl text-[15px] font-light leading-relaxed text-[#86868b]"
            variants={{ hover: { x: 12, color: "#1d1d1f" } }}
            transition={halus}
          >
            {project.description}
            {project.techStack.length > 0 && (
              <span className="mt-4 flex flex-wrap gap-1.5 pt-4">
                {project.techStack.map((tech) => (
                  <span key={tech} className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-600">
                    {tech}
                  </span>
                ))}
              </span>
            )}
          </motion.p>
        </div>

        <motion.span
          className="hidden shrink-0 text-xs font-light tracking-wide text-[#86868b] sm:block"
          variants={{ hover: { opacity: 1 } }}
          initial={{ opacity: 0.5 }}
          transition={halus}
        >
          {project.techStack.slice(0, 3).join("   ·   ")}
        </motion.span>

        <motion.span
          aria-hidden
          className="hidden shrink-0 text-lg font-light sm:block"
          variants={{ hover: { x: 10, opacity: 1 } }}
          initial={{ opacity: 0.25 }}
          transition={halus}
        >
          →
        </motion.span>
      </div>
    </motion.article>
  );
}

export function MinimalTheme({ projects, profil, kontak }: ThemeProps) {
  return (
    <div className="theme-minimal mx-auto w-full max-w-[72rem] px-6 pt-32 sm:px-10">
      <header className="py-12 sm:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex-1">
            <span className="eyebrow">{profil.status}</span>
            <h1 className="display mt-4 text-[clamp(2.5rem,7vw,5.5rem)] font-light tracking-tight text-neutral-900">
              {profil.judul[0]} {profil.judul[1]} {profil.judul[2]}
            </h1>

            <ProfilBlok
              profil={profil}
              kelas={{
                foto: "grayscale",
                bio: "text-sm leading-relaxed text-neutral-500",
                garis: "border-neutral-200",
                nilai: "font-medium text-neutral-900",
                tombol: "inline-flex items-center justify-center rounded-full border border-neutral-300 bg-transparent px-6 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-white"
              }}
            />
          </div>

          <HeroKananBlok 
            projects={projects} 
            kelas={{
              wadah: "flex w-full shrink-0 flex-col justify-center gap-4 lg:w-[26rem]",
              marqueeWadah: "relative flex flex-col justify-center gap-4 overflow-hidden border border-neutral-200 py-6",
              marqueeItem: "rounded-full border border-neutral-200 bg-transparent px-3 py-1.5 text-xs font-medium text-neutral-500",
              ctaWadah: "group relative flex flex-col justify-between overflow-hidden border border-neutral-200 p-8 text-neutral-900 transition-colors hover:bg-neutral-50",
              ctaJudul: "display text-2xl font-light tracking-tight",
              ctaTombol: "mt-6 inline-flex w-max items-center justify-center rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90",
            }} 
          />
        </div>
      </header>

      <section id="karya" className="scroll-mt-28">
        <div className="flex flex-col gap-16 md:gap-24">
          {projects.map((p, i) => (
            <MinimalCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      <KontakBlok
        kontak={kontak}
        kelas={{
          wadah: "mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
          item: "group flex items-center gap-6 border-t border-black/[0.08] py-8",
          ikon: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#1d1d1f]",
          nilai: "font-light text-[#1d1d1f]",
        }}
      />
    </div>
  );
}
