"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
          <p className="mt-4 max-w-xl text-[15px] leading-[1.75] text-black/65">
            {project.description}
          </p>
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

export function EditorialTheme({ projects }: ThemeProps) {
  return (
    <div className="theme-editorial mx-auto w-full max-w-[78rem] px-6 pb-40 pt-24 sm:px-12">
      <header className="border-b border-black/15 pb-16">
        <div className="flex items-baseline justify-between gap-6 text-[11px] uppercase tracking-[0.22em] text-black/45">
          <span>Portofolio</span>
          <span>Edisi 01</span>
        </div>

        {/* Judul sengaja melewati batas kolom teks di bawahnya — pelanggaran
            grid yang justru menjadi ciri tata letak cetak. */}
        <h1 className="mt-12 font-serif text-[clamp(3rem,9vw,7.5rem)] leading-[0.94] tracking-[-0.02em]">
          Membangun
          <br />
          <span className="italic">&amp; menjalankan</span>
          <br />
          sendiri.
        </h1>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-12">
          <p className="font-serif text-xl italic leading-relaxed text-black/70 md:col-span-5">
            Sebagian dibangun untuk klien, sebagian untuk rasa penasaran sendiri.
          </p>
          <p className="text-[15px] leading-[1.8] text-black/60 md:col-span-5 md:col-start-8">
            Setiap proyek di bawah ini berjalan di atas satu ThinkPad T480 yang menyala dua
            puluh empat jam — dari kode, basis data, sampai jalur masuknya.
          </p>
        </div>
      </header>

      <section className="pt-6">
        {projects.map((p, i) => (
          <EditorialRow key={p.id} project={p} index={i} />
        ))}
      </section>
    </div>
  );
}
