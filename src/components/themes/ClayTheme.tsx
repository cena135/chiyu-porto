"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroKananBlok, KontakBlok, ProfilBlok } from "./ThemeSections";
import type { ThemeProps, ThemeProject } from "./types";

/**
 * Kartu proyek versi Claymorphism.
 *
 * Gerakannya adalah kebalikan dari Neo: kartu MELESAK ke dalam saat ditekan.
 * Caranya bukan sekadar mengecilkan skala, tapi menukar bayangan luar dengan
 * bayangan dalam yang lebih dalam — tanah liat yang ditekan kehilangan
 * ketebalannya, dan itu hanya terbaca lewat bayangan.
 */

const PASTEL = ["#C4B5FD", "#A5D8FF", "#FBCFE8", "#BBF7D0"];

const empuk = { type: "spring" as const, stiffness: 260, damping: 20, mass: 0.8 };

const NAIK =
  "0 26px 40px -14px rgba(91,63,160,0.4), inset 0 5px 12px rgba(255,255,255,0.9), inset 0 -7px 14px rgba(91,63,160,0.18)";
const MELESAK =
  "0 6px 14px -8px rgba(91,63,160,0.35), inset 0 8px 18px rgba(91,63,160,0.28), inset 0 -3px 8px rgba(255,255,255,0.6)";

function ClayCard({ project, index }: { project: ThemeProject; index: number }) {
  const warna = PASTEL[index % PASTEL.length];

  return (
    <motion.article
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...empuk, delay: index * 0.06 }}
      whileHover={{ y: -8, boxShadow: NAIK, transition: empuk }}
      whileTap={{ scale: 0.975, boxShadow: MELESAK, transition: empuk }}
      className="clay-card group relative flex min-h-[16rem] flex-col justify-between rounded-[2rem] p-7"
    >
      <Link href={`/p/${project.slug}`} className="absolute inset-0 z-10" aria-label={project.title} />

      <div className="relative">
        <div className="flex items-center gap-3">
          <span
            className="clay-blob flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-[#3b2f63]"
            style={{ background: warna }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {project.isWip && (
            <span className="clay-blob rounded-full bg-[#fde68a] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#78350f]">
              WIP
            </span>
          )}
        </div>

        <h3 className="display mt-5 text-2xl text-[#3b2f63]">{project.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm font-medium leading-relaxed text-[#6b6191]">
          {project.description}
        </p>
        {project.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span key={tech} className="clay-card rounded-full bg-white px-3 py-1 text-[10px] font-bold text-neutral-600">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="relative mt-6 flex flex-wrap items-center gap-2">
        {project.techStack.slice(0, 3).map((t) => (
          <span
            key={t}
            className="clay-blob rounded-full bg-white/70 px-3 py-1 text-[10px] font-semibold text-[#6b6191]"
          >
            {t}
          </span>
        ))}
        <motion.span
          aria-hidden
          className="clay-blob ml-auto flex h-10 w-10 items-center justify-center rounded-2xl text-[#3b2f63]"
          style={{ background: warna }}
          whileHover={{ rotate: -12 }}
          transition={empuk}
        >
          →
        </motion.span>
      </div>
    </motion.article>
  );
}

export function ClayTheme({ projects, profil, kontak }: ThemeProps) {
  return (
    <div className="theme-clay mx-auto w-full max-w-[86rem] px-6 pt-20 sm:px-10">
      <header className="clay-card rounded-[2.5rem] p-8 sm:p-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex-1">
            <span className="eyebrow">{profil.status}</span>
            <h1 className="display mt-4 text-[clamp(2.5rem,7vw,5.5rem)]">
              {profil.judul[0]} {profil.judul[1]} {profil.judul[2]}
            </h1>

            <ProfilBlok
              profil={profil}
              kelas={{
                foto: "clay-blob rounded-[1.75rem]",
                bio: "text-sm leading-relaxed text-[#6b6191]",
                garis: "border-[#a99fd0]",
                nilai: "text-[#3b2f63]",
                tombol: "clay-blob inline-flex items-center justify-center rounded-2xl bg-[#C4B5FD] px-7 py-3.5 text-sm font-semibold text-[#3b2f63]"
              }}
            />
          </div>

          <HeroKananBlok 
            projects={projects} 
            kelas={{
              wadah: "flex w-full shrink-0 flex-col justify-center gap-4 lg:w-[26rem]",
              marqueeWadah: "clay-blob relative flex flex-col justify-center gap-4 overflow-hidden rounded-[2rem] bg-[#C4B5FD]/50 py-6",
              marqueeItem: "clay-blob rounded-2xl bg-white/50 px-3 py-1.5 text-xs font-semibold text-[#3b2f63]",
              ctaWadah: "clay-blob group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[#a99fd0] p-8 text-[#3b2f63]",
              ctaJudul: "display text-2xl font-bold",
              ctaTombol: "clay-blob mt-6 inline-flex w-max items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-[#3b2f63] transition-transform active:scale-95",
            }} 
          />
        </div>
      </header>

      <section id="karya" className="scroll-mt-28 pt-14">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:gap-16 lg:grid-cols-3 lg:gap-20">
          {projects.map((p, i) => (
            <ClayCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      <KontakBlok
        kontak={kontak}
        kelas={{
          item: "clay-card group flex items-center gap-4 rounded-[1.75rem] p-5",
          ikon: "clay-blob flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#C4B5FD] text-[#3b2f63]",
          nilai: "text-[#3b2f63]",
        }}
      />
    </div>
  );
}
