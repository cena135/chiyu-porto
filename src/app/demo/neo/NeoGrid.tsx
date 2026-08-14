"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { DemoProject } from "../_data";

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

function NeoCard({ project, index }: { project: DemoProject; index: number }) {
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

export function NeoGrid({ projects }: { projects: DemoProject[] }) {
  return (
    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <NeoCard key={p.id} project={p} index={i} />
      ))}
    </div>
  );
}
