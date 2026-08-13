"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ProjectWithImages } from "@/lib/projects";

const IconLock = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
  >
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
  </svg>
);

export function ProjectCard({
  project,
  index = 0,
}: {
  project: ProjectWithImages;
  index?: number;
}) {
  const cover = project.images[0];
  const nomor = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      data-motion-card
      // whileInView menggantikan IntersectionObserver buatan sendiri.
      // `once` supaya baris tidak dianimasikan ulang tiap kali di-scroll balik —
      // pengulangan itu yang membuat halaman panjang terasa gelisah.
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: "spring", stiffness: 80, damping: 18 }}
      className="group relative border-t border-white/8 last:border-b"
    >
      <Link
        href={`/p/${project.slug}`}
        aria-label={`Lihat detail proyek ${project.title}`}
        className="absolute inset-0 z-0"
      />

      <div className="pointer-events-none relative flex flex-col gap-5 px-1 py-7 sm:flex-row sm:items-center sm:gap-7 sm:py-8">
        <span className="eyebrow shrink-0 sm:w-10">{nomor}</span>

        {/* Panel gambar — ramping, mengikuti bentuk baris */}
        <div className="card-media radius-modern relative h-24 w-full shrink-0 overflow-hidden border border-white/8 bg-surface sm:h-20 sm:w-36 lg:h-24 lg:w-48">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.url}
              alt={cover.alt || project.title}
              loading={index < 3 ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            /* Tanpa screenshot — lazim untuk proyek internal/NDA.
               Monokrom: mesh gradient warna-warni yang lama akan bertabrakan
               dengan palet hitam-putih ini. */
            <span className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(120%_120%_at_30%_20%,rgb(255_255_255/0.10),transparent_60%)] text-text-dim">
              {IconLock}
            </span>
          )}
        </div>

        {/* Teks — bergeser sedikit saat baris disorot */}
        <div className="min-w-0 flex-1 transition-transform duration-500 group-hover:translate-x-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="display text-[clamp(1.35rem,3vw,2.4rem)] text-text-dim transition-colors group-hover:text-text">
              {project.title}
            </h3>
            {project.isWip && (
              <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-text">
                WIP
              </span>
            )}
            {project.featured && <span className="eyebrow eyebrow-bright">Unggulan</span>}
            {!cover && <span className="eyebrow">Internal</span>}
          </div>

          <p className="mt-2 line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-text-dim sm:line-clamp-1">
            {project.description}
          </p>
        </div>

        {/* Tech stack — sembunyi di layar sempit supaya baris tetap padat */}
        {project.techStack.length > 0 && (
          <p className="eyebrow hidden max-w-[13rem] shrink-0 truncate text-right lg:block">
            {project.techStack.slice(0, 3).join(" · ")}
          </p>
        )}

        <div className="flex shrink-0 items-center gap-4">
          <span className="flex items-center gap-3 text-[11px]">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto relative z-10 text-text-dim transition-colors hover:text-text"
              >
                Live ↗
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto relative z-10 text-text-dim transition-colors hover:text-text"
              >
                Source
              </a>
            )}
          </span>

          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-text-dim transition-all group-hover:border-white/40 group-hover:bg-white/5 group-hover:text-text"
          >
            <span className="-translate-x-1 opacity-70 transition-all group-hover:translate-x-0 group-hover:opacity-100">
              →
            </span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}
