"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { KontakBlok, ProfilBlok } from "./ThemeSections";
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
    <div className="theme-minimal mx-auto w-full max-w-[72rem] px-6 pb-48 pt-32 sm:px-10">
      <header className="pb-32">
        <span className="eyebrow">{profil.status}</span>
        <h1 className="display mt-10 text-[clamp(3rem,9vw,7rem)]">
          {profil.judul[0]}
          <br />
          {profil.judul[1]} {profil.judul[2]}
        </h1>

        <ProfilBlok
          profil={profil}
          kelas={{
            wadah: "mt-20 flex max-w-2xl flex-col gap-8 sm:flex-row sm:items-start sm:gap-12",
            foto: "rounded-full",
            bio: "text-lg font-light leading-relaxed text-[#86868b]",
            garis: "border-black/15",
            nilai: "font-light text-[#1d1d1f]",
          }}
        />
      </header>

      <section id="karya" className="scroll-mt-28">
        {projects.map((p, i) => (
          <MinimalCard key={p.id} project={p} index={i} />
        ))}
      </section>

      <KontakBlok
        kontak={kontak}
        kelas={{
          wadah: "mt-8",
          item: "group flex items-center gap-6 border-t border-black/[0.08] py-8",
          ikon: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#1d1d1f]",
          nilai: "font-light text-[#1d1d1f]",
        }}
      />
    </div>
  );
}
