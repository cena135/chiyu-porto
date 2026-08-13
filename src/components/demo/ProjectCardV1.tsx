"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ProjectWithImages } from "@/lib/projects";

/**
 * V1 · Apple Pro Clean Modern.
 *
 * TANPA tilt 3D dan TANPA glare — keduanya sengaja dibuang. Bahasa desain Apple
 * membangun kedalaman lewat bayangan dan ruang, bukan lewat kartu yang miring
 * mengikuti kursor. Yang tersisa: skala 1.02 yang nyaris tak terasa dan
 * bayangan tajam.
 */
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

export function ProjectCardV1({
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
      whileHover={{ scale: 1.02 }}
      className="group relative rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition-shadow duration-300 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] sm:p-6"
      style={{ fontFamily: "var(--font-outfit)" }}
    >
      <Link
        href={`/p/${project.slug}`}
        aria-label={`Lihat detail proyek ${project.title}`}
        className="absolute inset-0 z-0 rounded-2xl"
      />

      <div className="pointer-events-none relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
        <span className="eyebrow shrink-0 sm:w-10">{nomor}</span>

        <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl border border-white/8 bg-surface sm:w-32 lg:w-44">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.url}
              alt={cover.alt || project.title}
              loading={index < 3 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(120%_120%_at_30%_20%,rgb(255_255_255/0.10),transparent_60%)] text-text-dim">
              {IconLock}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-[clamp(1.15rem,2.4vw,1.8rem)] font-medium tracking-tight text-text">
              {project.title}
            </h3>
            {project.isWip && (
              <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-text-dim">
                WIP
              </span>
            )}
            {!cover && <span className="eyebrow">Internal</span>}
          </div>
          <p className="mt-2 line-clamp-1 max-w-2xl text-[13px] leading-relaxed text-text-dim">
            {project.description}
          </p>
        </div>

        {project.techStack.length > 0 && (
          <p className="eyebrow hidden max-w-[13rem] shrink-0 truncate text-right lg:block">
            {project.techStack.slice(0, 3).join(" · ")}
          </p>
        )}

        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 text-text-dim transition-colors group-hover:border-white/35 group-hover:text-text"
        >
          →
        </span>
      </div>
    </motion.article>
  );
}
