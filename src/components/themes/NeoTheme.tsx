"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroKananBlok, KontakBlok, ProfilBlok } from "./ThemeSections";
import type { ThemeProps, ThemeProject } from "./types";

/**
 * Kartu proyek versi Neo Brutalism.
 *
 * Gerakannya sengaja KAKU: kartu melompat ke kiri-atas dan bayangannya
 * memanjang, seolah benda padat yang terangkat. Pegas dibuat sangat kencang
 * dengan redaman rendah supaya ada pantulan yang terasa — gerak yang halus dan
 * melunak justru melawan seluruh bahasa visual gaya ini.
 */

const WARNA = ["#FF5A5F", "#2563EB", "#FFDD57", "#22C55E"];

const pantul = { type: "spring" as const, stiffness: 700, damping: 14, mass: 0.6 };

function NeoCard({ project, index }: { project: ThemeProject; index: number }) {
  const warna = WARNA[index % WARNA.length];

  return (
    <motion.article
      initial={{ opacity: 0, x: -30, y: 10 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 160, damping: 18, delay: index * 0.05 }}
      whileHover={{
        x: -6,
        y: -6,
        // Bayangan ikut memanjang saat kartu terangkat — inilah yang membuat
        // kartunya terbaca sebagai lempengan padat, bukan gambar yang bergeser.
        boxShadow: "14px 14px 0 0 #000000",
        transition: pantul,
      }}
      whileTap={{ x: 2, y: 2, boxShadow: "4px 4px 0 0 #000000", transition: pantul }}
      className="neo-card group relative flex min-h-[16rem] flex-col justify-between p-6"
    >
      <Link href={`/p/${project.slug}`} className="absolute inset-0 z-10" aria-label={project.title} />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <span
            className="neo-tag inline-block px-3 py-1 text-xs font-black uppercase"
            style={{ background: warna }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {project.isWip && (
            <span className="neo-tag inline-block bg-white px-3 py-1 text-[10px] font-black uppercase">
              WIP
            </span>
          )}
        </div>

        <h3 className="display mt-5 text-2xl leading-none">{project.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm font-medium leading-relaxed text-neutral-800">
          {project.description}
        </p>
        {project.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span key={tech} className="neo-tag bg-white px-2 py-1 text-[10px] font-black uppercase text-black">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="relative mt-6 flex flex-wrap items-center gap-2">
        {project.techStack.slice(0, 3).map((t) => (
          <span key={t} className="border-2 border-black bg-white px-2 py-0.5 text-[10px] font-bold uppercase">
            {t}
          </span>
        ))}
        <span
          aria-hidden
          className="ml-auto border-2 border-black px-3 py-1 text-sm font-black transition-transform group-hover:translate-x-1"
          style={{ background: warna }}
        >
          →
        </span>
      </div>
    </motion.article>
  );
}

export function NeoTheme({ projects, profil, kontak }: ThemeProps) {
  return (
    <div className="theme-neo mx-auto w-full max-w-[86rem] px-6 pb-32 pt-20 sm:px-10">
      <header className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] sm:p-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex-1">
            <span className="eyebrow">{profil.status}</span>
            <h1 className="display mt-4 text-[clamp(2.5rem,8vw,6rem)]">
              {profil.judul[0]}
              <br />
              {profil.judul[1]}
            </h1>

            <ProfilBlok
              profil={profil}
              kelas={{
                foto: "border-4 border-black",
                bio: "text-sm font-medium leading-relaxed text-neutral-800",
                garis: "border-black/40",
                nilai: "font-bold",
                tombol: "neo-tag inline-flex items-center justify-center bg-[#FFDD57] px-6 py-3 text-sm font-black uppercase text-black"
              }}
            />
          </div>

          <HeroKananBlok 
            projects={projects} 
            kelas={{
              wadah: "flex w-full shrink-0 flex-col justify-center gap-4 lg:w-[26rem]",
              marqueeWadah: "relative flex flex-col justify-center gap-4 overflow-hidden border-4 border-black bg-[#FF5A5F] py-6 shadow-[4px_4px_0_0_#000] text-black",
              marqueeItem: "neo-tag bg-white px-2 py-1 text-[10px] font-black uppercase text-black",
              ctaWadah: "group relative flex flex-col justify-between overflow-hidden border-4 border-black bg-black p-8 text-white shadow-[4px_4px_0_0_#000]",
              ctaJudul: "display text-2xl font-bold",
              ctaTombol: "neo-tag mt-6 inline-flex w-max items-center justify-center bg-[#FFDD57] px-6 py-3 text-sm font-black uppercase text-black",
            }} 
          />
        </div>
      </header>

      <section id="karya" className="scroll-mt-28 pt-14">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <NeoCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      <KontakBlok
        kontak={kontak}
        kelas={{
          item: "neo-card group flex items-center gap-4 p-5",
          ikon: "flex h-11 w-11 shrink-0 items-center justify-center border-2 border-black bg-[#FFDD57]",
          nilai: "font-bold",
        }}
      />
    </div>
  );
}
