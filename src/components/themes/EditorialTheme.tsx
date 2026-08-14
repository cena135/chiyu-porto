"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroKananBlok, KontakBlok, ProfilBlok } from "./ThemeSections";
import type { ThemeProps, ThemeProject } from "./types";

/**
 * Editorial — tata letak majalah cetak.
 *
 * Yang membuat sebuah halaman terbaca sebagai "majalah" bukan fontnya, tapi
 * ASIMETRINYA: kolom yang tidak sama lebar, dan baris yang bergantian rata
 * kiri-kanan. Grid yang rapi seragam akan tetap terlihat seperti situs web
 * biasa walau dipasangi serif semewah apa pun.
 */

const halus = { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const };

function EditorialRow({ project, index }: { project: ThemeProject; index: number }) {
  const kanan = index % 2 === 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ ...halus, delay: (index % 3) * 0.06 }}
      className="group relative border-t border-black/15"
    >
      <Link href={`/p/${project.slug}`} className="absolute inset-0 z-10" aria-label={project.title} />

      <div
        className={[
          "relative grid grid-cols-1 gap-6 py-12 md:grid-cols-12 md:gap-10",
          kanan ? "md:pl-[16%]" : "md:pr-[16%]",
        ].join(" ")}
      >
        <div className="md:col-span-2">
          <span className="font-serif text-4xl italic text-black/25">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="md:col-span-7">
          <h3 className="font-serif text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.1] tracking-[-0.01em]">
            {project.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-neutral-600">
            {project.description}
          </p>
          {project.techStack.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span key={tech} className="border-b border-black/20 text-[10px] font-medium uppercase tracking-wider text-black/70">
                  {tech}
                </span>
              ))}
            </div>
          )}
          <span className="mt-6 inline-flex items-center gap-2 border-b border-black pb-0.5 text-xs uppercase tracking-[0.16em] transition-all group-hover:gap-4">
            Baca selengkapnya <span aria-hidden>→</span>
          </span>
        </div>

        <div className="md:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-black/40">
            {project.isWip ? "Sedang dikerjakan" : "Selesai"}
          </p>
          <ul className="mt-3 space-y-1">
            {project.techStack.slice(0, 4).map((t) => (
              <li key={t} className="font-serif text-sm italic text-black/60">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.article>
  );
}

export function EditorialTheme({ projects, profil, kontak }: ThemeProps) {
  return (
    <div className="theme-editorial mx-auto w-full max-w-[78rem] px-6 pt-24 sm:px-12">
      <header className="border-b border-black/15 pb-16">
        <div className="flex items-baseline justify-between gap-6 text-[11px] uppercase tracking-[0.22em] text-black/45">
          <span>Portofolio</span>
          <span>Edisi 01</span>
        </div>

        <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex-1">
            {/* Judul sengaja melewati batas kolom teks di bawahnya — pelanggaran
                grid yang justru menjadi ciri tata letak cetak. */}
            <h1 className="font-serif text-[clamp(3rem,9vw,7.5rem)] leading-[0.94] tracking-[-0.02em]">
              {profil.judul[0]}
              <br />
              <span className="italic">{profil.judul[1]}</span>
              <br />
              {profil.judul[2]}
            </h1>

            <ProfilBlok
              profil={profil}
              kelas={{
                wadah: "mt-14 flex max-w-3xl flex-col gap-8 sm:flex-row sm:items-start sm:gap-10",
                foto: "rounded-none grayscale",
                bio: "font-serif text-xl italic leading-relaxed text-black/70",
                garis: "border-black/25",
                nilai: "text-black/70",
                tombol: "inline-flex items-center justify-center border border-black bg-transparent px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white"
              }}
            />
          </div>

          <HeroKananBlok 
            projects={projects} 
            kelas={{
              wadah: "flex w-full shrink-0 flex-col justify-center gap-4 lg:w-[26rem]",
              marqueeWadah: "relative flex flex-col justify-center gap-4 overflow-hidden border border-black/15 bg-[#F9F7F1] py-6",
              marqueeItem: "border border-black/15 bg-transparent px-3 py-1.5 text-xs font-medium text-black/70",
              ctaWadah: "group relative flex flex-col justify-between overflow-hidden border border-black/15 p-8 text-black transition-colors hover:bg-black/5",
              ctaJudul: "font-serif text-2xl italic",
              ctaTombol: "mt-6 inline-flex w-max items-center justify-center border border-black bg-black px-6 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90",
            }} 
          />
        </div>
      </header>

      <section id="karya" className="scroll-mt-28 pt-6">
        <div className="flex flex-col gap-16 md:gap-24">
          {projects.map((p, i) => (
            <EditorialRow key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      <KontakBlok
        kontak={kontak}
        kelas={{
          wadah: "mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
          item: "group flex items-center gap-4 border-t border-black/15 py-7",
          ikon: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/20",
          nilai: "font-serif text-base",
        }}
      />
    </div>
  );
}
