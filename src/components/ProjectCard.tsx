"use client";

import Link from "next/link";
import type { ProjectWithImages } from "@/lib/projects";
import { useInView } from "@/lib/useInView";

/**
 * Palet mesh gradient untuk proyek tanpa screenshot.
 *
 * Dipilih dengan `index % PALETTES.length`, bukan dari hash judul: cara ini
 * MENJAMIN dua baris bersebelahan tidak pernah kembar warnanya.
 *
 * Alpha tiap warna sengaja rendah, lalu masih ditumpuk peredam gelap — supaya
 * warnanya terbaca sebagai nuansa, bukan lampu neon.
 */
const PALETTES: [string, string, string][] = [
  ["#6366f166", "#a855f74d", "#22d3ee4d"], // indigo · violet · cyan
  ["#fb718566", "#f59e0b4d", "#f472b64d"], // rose · amber · pink
  ["#34d39966", "#14b8a64d", "#38bdf84d"], // emerald · teal · sky
  ["#a78bfa66", "#f472b64d", "#fbbf244d"], // violet · pink · amber
  ["#22d3ee66", "#3b82f64d", "#8b5cf64d"], // cyan · blue · violet
  ["#e879f966", "#8b5cf64d", "#6366f14d"], // fuchsia · violet · indigo
  ["#a3e63566", "#34d3994d", "#22d3ee4d"], // lime · emerald · cyan
  ["#38bdf866", "#6366f14d", "#fb71854d"], // sky · indigo · rose
];

/** Panel ramping: titik cahaya disebar MENDATAR, mengikuti bentuk baris. */
function meshPanel([a, b, c]: [string, string, string]) {
  return [
    `radial-gradient(90% 160% at 10% 20%, ${a} 0%, transparent 60%)`,
    `radial-gradient(80% 150% at 55% 90%, ${b} 0%, transparent 58%)`,
    `radial-gradient(90% 160% at 95% 15%, ${c} 0%, transparent 60%)`,
  ].join(", ");
}

/** Sapuan warna selebar baris, muncul hanya saat disorot. */
function meshRow([a, b, c]: [string, string, string]) {
  return [
    `radial-gradient(40% 180% at 8% 50%, ${a} 0%, transparent 70%)`,
    `radial-gradient(35% 160% at 45% 50%, ${b} 0%, transparent 70%)`,
    `radial-gradient(40% 180% at 85% 50%, ${c} 0%, transparent 70%)`,
  ].join(", ");
}

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
  const { ref, inView } = useInView<HTMLDivElement>();

  const cover = project.images[0];
  const palette = PALETTES[index % PALETTES.length];
  const nomor = String(index + 1).padStart(2, "0");

  return (
    <div ref={ref} className={`slide-in ${inView ? "is-visible" : ""}`}>
      <article className="group relative border-t border-white/8 last:border-b">
        {/* Sapuan warna sepanjang baris — 0 saat diam, muncul halus saat disorot */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ backgroundImage: meshRow(palette) }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-ink-950/55 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <Link
          href={`/p/${project.slug}`}
          aria-label={`Lihat detail proyek ${project.title}`}
          className="absolute inset-0 z-0"
        />

        <div className="pointer-events-none relative flex flex-col gap-5 px-1 py-7 sm:flex-row sm:items-center sm:gap-7 sm:py-8">
          {/* Nomor indeks */}
          <span className="eyebrow shrink-0 text-mist-400/60 sm:w-10">{nomor}</span>

          {/* Panel gambar / gradien — ramping, mengikuti bentuk baris */}
          <div className="card-media relative h-24 w-full shrink-0 overflow-hidden rounded-xl border border-white/8 bg-ink-950 sm:h-20 sm:w-36 lg:h-24 lg:w-48">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover.url}
                alt={cover.alt || project.title}
                loading={index < 3 ? "eager" : "lazy"}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0 scale-105 transition-transform duration-700 group-hover:scale-125"
                  style={{ backgroundImage: meshPanel(palette) }}
                />
                <div aria-hidden className="absolute inset-0 bg-ink-950/35" />
                <span className="absolute inset-0 flex items-center justify-center text-white/70">
                  {IconLock}
                </span>
              </>
            )}
          </div>

          {/* Teks — bergeser ke kanan saat baris disorot */}
          <div className="min-w-0 flex-1 transition-transform duration-500 group-hover:translate-x-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="display text-[clamp(1.35rem,3vw,2.4rem)] text-mist-300 transition-colors duration-300 group-hover:text-mist-200">
                {project.title}
              </h3>
              {project.featured && <span className="eyebrow text-aurora">Unggulan</span>}
              {!cover && <span className="eyebrow text-mist-400/70">Internal</span>}
            </div>

            <p className="mt-2 line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-mist-400/90 sm:line-clamp-1">
              {project.description}
            </p>
          </div>

          {/* Tech stack — sembunyi di layar sempit supaya baris tetap padat */}
          {project.techStack.length > 0 && (
            <p className="eyebrow hidden max-w-[13rem] shrink-0 truncate text-right text-mist-400/70 lg:block">
              {project.techStack.slice(0, 3).join(" · ")}
            </p>
          )}

          {/* Tautan keluar + panah */}
          <div className="flex shrink-0 items-center gap-4">
            <span className="flex items-center gap-3 text-[11px]">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto relative z-10 text-mist-400/80 transition-colors hover:text-mist-200"
                >
                  Live ↗
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto relative z-10 text-mist-400/80 transition-colors hover:text-mist-200"
                >
                  Source
                </a>
              )}
            </span>

            {/* Panah meluncur masuk dari kiri saat disorot */}
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-mist-400 transition-all duration-500 group-hover:-translate-x-0 group-hover:border-aurora/50 group-hover:bg-aurora/10 group-hover:text-aurora"
            >
              <span className="-translate-x-1 opacity-70 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                →
              </span>
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}
