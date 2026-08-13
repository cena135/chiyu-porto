"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { ProjectWithImages } from "@/lib/projects";
import { useCursor } from "@/components/ui/cursor-store";
import { ScrambleText } from "@/components/ui/ScrambleText";

/**
 * V3 · Pro Veteran Coder.
 *
 * TANPA liquid glass — kaca buram tidak masuk akal di bahasa visual terminal.
 * Penggantinya border bercahaya neon dan latar hampir pekat, persis seperti
 * panel di editor kode.
 *
 * Judulnya diacak ulang tiap kali disorot: `replayKey` dinaikkan, dan
 * ScrambleText memutar animasinya dari awal.
 */
export function ProjectCardV3({
  project,
  index = 0,
}: {
  project: ProjectWithImages;
  index?: number;
}) {
  const cover = project.images[0];
  const nomor = String(index + 1).padStart(2, "0");
  const [replay, setReplay] = useState(0);
  const { setVariant } = useCursor();

  return (
    <motion.article
      initial={{ opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      onMouseEnter={() => {
        setReplay((n) => n + 1);
        setVariant("explore");
      }}
      onMouseLeave={() => setVariant("default")}
      whileTap={{ scale: 0.98 }}
      className="group relative border border-[#22d3ee]/20 bg-[#00120c]/60 p-5 transition-all duration-300 hover:border-[#22d3ee]/60 hover:shadow-[0_0_30px_-6px_rgba(34,211,238,0.45)] sm:p-6"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <Link
        href={`/p/${project.slug}`}
        aria-label={`Lihat detail proyek ${project.title}`}
        className="absolute inset-0 z-0"
      />

      <div className="pointer-events-none relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <span className="shrink-0 text-[11px] text-[#22c55e] sm:w-12">
          [{nomor}]
        </span>

        <div className="relative h-20 w-full shrink-0 overflow-hidden border border-[#22c55e]/25 bg-black sm:w-32 lg:w-44">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.url}
              alt={cover.alt || project.title}
              loading={index < 3 ? "eager" : "lazy"}
              // Sedikit hijau: screenshot berwarna penuh akan menabrak palet
              // terminal di sekelilingnya.
              className="h-full w-full object-cover opacity-70 saturate-50 transition-all duration-500 group-hover:opacity-100 group-hover:saturate-100"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] tracking-[0.2em] text-[#22c55e]/70">
              [ CLASSIFIED ]
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-[clamp(1rem,2.2vw,1.6rem)] font-semibold text-[#d7ffe9]">
              <ScrambleText text={project.title} replayKey={replay} speed={1} />
            </h3>
            {project.isWip && (
              <span className="border border-[#22d3ee]/40 px-2 py-0.5 text-[10px] tracking-[0.14em] text-[#22d3ee]">
                WIP
              </span>
            )}
            {!cover && (
              <span className="text-[10px] tracking-[0.14em] text-[#22c55e]/70">
                --internal
              </span>
            )}
          </div>
          <p className="mt-2 line-clamp-1 max-w-2xl text-[12px] leading-relaxed text-[#4ade80]">
            <span className="text-[#22c55e]/60">$ </span>
            {project.description}
          </p>
        </div>

        {project.techStack.length > 0 && (
          <p className="hidden max-w-[13rem] shrink-0 truncate text-right text-[10px] tracking-[0.12em] text-[#22c55e]/70 lg:block">
            {project.techStack.slice(0, 3).join(" | ")}
          </p>
        )}

        <span
          aria-hidden
          className="shrink-0 text-[#22d3ee] transition-transform duration-300 group-hover:translate-x-1"
        >
          {"->"}
        </span>
      </div>
    </motion.article>
  );
}
