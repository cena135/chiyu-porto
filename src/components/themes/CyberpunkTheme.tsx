"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScrambleText } from "./ScrambleText";
import { HeroKananBlok, KontakBlok, ProfilBlok } from "./ThemeSections";
import type { ThemeProps, ThemeProject } from "./types";

/**
 * Cyberpunk — panel terminal dengan garis neon.
 *
 * TANPA kaca buram: permukaan yang lembut melawan bahasa visual terminal.
 * Penggantinya border bercahaya dan latar hampir pekat, persis seperti panel
 * di editor kode.
 */

function CyberCard({ project, index }: { project: ThemeProject; index: number }) {
  // Judul diacak ulang tiap kali disorot: kuncinya dinaikkan, dan ScrambleText
  // memutar animasinya dari awal.
  const [replay, setReplay] = useState(0);
  const nomor = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 130, damping: 18, delay: index * 0.04 }}
      onMouseEnter={() => setReplay((n) => n + 1)}
      whileTap={{ scale: 0.985 }}
      className="cyber-card group relative flex min-h-[14rem] flex-col justify-between p-6"
    >
      <Link href={`/p/${project.slug}`} className="absolute inset-0 z-10" aria-label={project.title} />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#22c55e]">[{nomor}]</span>
          {project.isWip && (
            <span className="border border-[#22d3ee]/50 px-2 py-0.5 text-[10px] tracking-[0.14em] text-[#22d3ee]">
              WIP
            </span>
          )}
        </div>

        <h3 className="mt-4 text-xl font-semibold text-[#d7ffe9]">
          <ScrambleText text={project.title} replayKey={replay} speed={1} />
        </h3>

        <p className="mt-3 line-clamp-3 text-[12px] leading-relaxed text-[#4ade80]">
          <span className="text-[#22c55e]/60">$ </span>
          {project.description}
        </p>
        {project.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span key={tech} className="border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="relative mt-6 flex items-center gap-2">
        <span
          aria-hidden
          className="ml-auto text-[#22d3ee] transition-transform duration-300 group-hover:translate-x-1"
        >
          {"->"}
        </span>
      </div>
    </motion.article>
  );
}

export function CyberpunkTheme({ projects, profil, kontak }: ThemeProps) {
  return (
    <div className="theme-cyber mx-auto w-full max-w-[86rem] px-6 pt-20 sm:px-10">
      <header className="cyber-card p-8 sm:p-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex-1">
            <p className="text-[11px] tracking-[0.2em] text-[#22c55e]/70">
              alex@t480:~$ ./portofolio --mode=cyberpunk
            </p>
            <h1 className="mt-6 text-[clamp(2rem,6vw,4.5rem)] font-bold leading-none text-[#d7ffe9]">
              <ScrambleText text={profil.judul.join(" ").toUpperCase()} speed={1} />
            </h1>

            <ProfilBlok
              profil={profil}
              kelas={{
                foto: "border border-[#22d3ee]/40 saturate-[0.6]",
                bio: "text-[13px] leading-relaxed text-[#4ade80]",
                garis: "border-[#22c55e]/30",
                nilai: "text-[#d7ffe9]",
                tombol: "inline-flex items-center justify-center border border-[#22c55e]/50 bg-transparent px-6 py-2.5 text-[13px] font-bold uppercase text-[#22c55e] transition-colors hover:bg-[#22c55e]/20"
              }}
            />

            <span className="caret mt-6 inline-block text-sm text-[#22d3ee]" aria-hidden />
          </div>

          <HeroKananBlok 
            projects={projects} 
            kelas={{
              wadah: "flex w-full shrink-0 flex-col justify-center gap-4 lg:w-[26rem]",
              marqueeWadah: "relative flex flex-col justify-center gap-4 overflow-hidden border border-[#22c55e]/30 bg-[#0a192f]/50 py-6",
              marqueeItem: "border border-[#22c55e]/30 bg-transparent px-3 py-1.5 text-[11px] font-bold text-[#4ade80]",
              ctaWadah: "group relative flex flex-col justify-between overflow-hidden border border-[#22d3ee]/40 bg-[#050b14] p-8 text-[#d7ffe9] transition-colors hover:border-[#22d3ee]",
              ctaJudul: "text-2xl font-bold uppercase",
              ctaTombol: "mt-6 inline-flex w-max items-center justify-center border border-[#22d3ee]/50 bg-[#22d3ee]/10 px-6 py-3.5 text-[13px] font-bold uppercase text-[#22d3ee] transition-all hover:bg-[#22d3ee]/20",
            }} 
          />
        </div>
      </header>

      <section id="karya" className="scroll-mt-28 pt-12">
        <p className="mb-6 text-[11px] tracking-[0.2em] text-[#22c55e]/70">
          {"// daftar proyek"}
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <CyberCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      <KontakBlok
        kontak={kontak}
        judul="// kontak"
        kelas={{
          item: "cyber-card group flex items-center gap-4 p-5",
          ikon: "flex h-11 w-11 shrink-0 items-center justify-center border border-[#22d3ee]/40 text-[#22d3ee]",
          nilai: "text-[#d7ffe9]",
        }}
      />
    </div>
  );
}
