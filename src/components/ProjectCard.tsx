"use client";

import Link from "next/link";
import type { ProjectWithImages } from "@/lib/projects";
import { useInView } from "@/lib/useInView";

const initials = (title: string) =>
  title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

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

  // Stagger per kolom (index % 3), bukan index global: kartu di baris ke-10 tetap
  // muncul cepat saat di-scroll ke sana, tidak menunggu antrean 10 x delay.
  const stagger = (index % 3) * 90;

  return (
    <div
      ref={ref}
      className={`slide-in ${inView ? "is-visible" : ""}`}
      style={{ "--stagger": `${stagger}ms` } as React.CSSProperties}
    >
      <article className="glass card-hover group relative overflow-hidden rounded-3xl">
        {/* Stretched link: seluruh kartu bisa diklik menuju halaman detail, tapi tanpa
            membungkus <a> lain di dalamnya (HTML melarang anchor bersarang).
            Link keluar di bawah diberi z-10 supaya tetap bisa diklik sendiri. */}
        <Link
          href={`/p/${project.slug}`}
          aria-label={`Lihat detail proyek ${project.title}`}
          className="absolute inset-0 z-0"
        />

        <div className="card-media relative aspect-[16/10] overflow-hidden bg-ink-800">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.url}
              alt={cover.alt || project.title}
              loading={index < 3 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-800 to-ink-900">
              <span className="font-display text-5xl font-semibold text-mist-400/40">
                {initials(project.title)}
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent" />

          {project.featured && (
            <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium tracking-wide text-aurora backdrop-blur-md">
              Unggulan
            </span>
          )}

          {images.length > 1 && (
            <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium text-mist-200 backdrop-blur-md transition-colors group-hover:text-aurora">
              ▦ {images.length} foto
            </span>
          )}
        </div>

        {/* pointer-events-none: klik di area teks tembus ke stretched link di bawahnya */}
        <div className="pointer-events-none space-y-4 p-6">
          <div className="space-y-2">
            <h3 className="font-display text-xl font-semibold tracking-tight text-mist-200 transition-colors group-hover:text-aurora">
              {project.title}
            </h3>
            <p className="line-clamp-3 text-sm leading-relaxed text-mist-400">
              {project.description}
            </p>
          </div>

          {/* Pratinjau isi galeri — dekoratif, klik tetap menuju halaman detail. */}
          {images.length > 1 && (
            <div className="flex gap-1.5">
              {images.slice(1, 6).map((img) => (
                <span
                  key={img.id}
                  className="h-10 w-14 shrink-0 overflow-hidden rounded-md border border-white/8 opacity-60 transition-opacity group-hover:opacity-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </span>
              ))}
              {images.length > 6 && (
                <span className="flex h-10 items-center px-1 text-[11px] text-mist-400">
                  +{images.length - 6}
                </span>
              )}
            </div>
          )}

          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.techStack.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[11px] text-mist-400 transition-colors group-hover:border-white/15"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-1 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 text-aurora">
              Lihat Detail
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>

            {/* pointer-events-auto + z-10: dua tautan ini menembus overlay stretched link */}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto relative z-10 text-mist-400 transition-colors hover:text-mist-200"
              >
                Live ↗
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto relative z-10 text-mist-400 transition-colors hover:text-mist-200"
              >
                Source
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
