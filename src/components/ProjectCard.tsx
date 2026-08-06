"use client";

import Link from "next/link";
import type { ProjectWithImages } from "@/lib/projects";
import { useInView } from "@/lib/useInView";

/** Ikon gembok kecil — penanda tenang untuk proyek tanpa screenshot. */
const IconLock = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
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

  const images = project.images;
  const cover = images[0];
  const stagger = (index % 3) * 90;

  return (
    <div
      ref={ref}
      className={`slide-in h-full ${inView ? "is-visible" : ""}`}
      style={{ "--stagger": `${stagger}ms` } as React.CSSProperties}
    >
      <article className="card-hover group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/8 bg-ink-900/40 backdrop-blur-xl">
        <Link
          href={`/p/${project.slug}`}
          aria-label={`Lihat detail proyek ${project.title}`}
          className="absolute inset-0 z-0"
        />

        {/* 16:9 — lebih pendek dari sebelumnya, jadi kartu tidak menjulang */}
        <div className="card-media relative aspect-video overflow-hidden">
          {cover ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover.url}
                alt={cover.alt || project.title}
                loading={index < 3 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
            </>
          ) : (
            /* Tanpa screenshot — biasa untuk proyek internal/NDA.
               Sengaja dibiarkan HAMPIR KOSONG: gradien sangat halus, satu ikon
               kecil, tanpa pola garis dan tanpa tipografi raksasa. Bidang tenang
               ini yang membuat judul di bawahnya jadi fokus utama. */
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-800/60 via-ink-900/40 to-ink-950/60 backdrop-blur-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-mist-400/80">
                {IconLock}
                <span className="text-[10px] uppercase tracking-[0.18em]">Internal</span>
              </span>
            </div>
          )}

          {project.featured && (
            <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-aurora backdrop-blur-md">
              Unggulan
            </span>
          )}

          {images.length > 1 && (
            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[10px] text-mist-300 backdrop-blur-md">
              {images.length} foto
            </span>
          )}
        </div>

        {/* pointer-events-none: klik di area teks tembus ke stretched link */}
        <div className="pointer-events-none flex flex-1 flex-col gap-3 border-t border-white/6 p-5">
          <h3 className="font-display text-lg font-medium leading-snug tracking-tight text-mist-300 transition-colors group-hover:text-mist-200">
            {project.title}
          </h3>

          <p className="line-clamp-2 text-[13px] leading-relaxed text-mist-400/90">
            {project.description}
          </p>

          {project.techStack.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
              {project.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-white/6 bg-white/[0.03] px-2 py-0.5 text-[10.5px] text-mist-400/80"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 3 && (
                <span className="px-1 py-0.5 text-[10.5px] text-mist-400/60">
                  +{project.techStack.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-white/6 pt-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-mist-400 transition-colors group-hover:text-aurora">
              Lihat detail
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>

            {/* pointer-events-auto + z-10: menembus overlay stretched link */}
            <span className="flex items-center gap-3">
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
          </div>
        </div>
      </article>
    </div>
  );
}
