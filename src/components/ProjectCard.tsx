"use client";

import Link from "next/link";
import type { ProjectWithImages } from "@/lib/projects";
import { useInView } from "@/lib/useInView";

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
  const nomor = String(index + 1).padStart(2, "0");

  // Bentuk sudut berselang-seling supaya dua kartu bertetangga tidak kembar.
  const shape = index % 2 === 0 ? "radius-organic" : "radius-organic-alt";

  // Stagger per kolom, bukan index global: kartu di baris bawah tetap muncul
  // cepat saat di-scroll ke sana, tidak menunggu antrean panjang.
  const stagger = (index % 3) * 90;

  return (
    <div
      ref={ref}
      className={`slide-in ${inView ? "is-visible" : ""}`}
      style={{ "--stagger": `${stagger}ms` } as React.CSSProperties}
    >
      <article
        className={`card-hover group relative ${shape} overflow-hidden border border-white/8 bg-ink-900/30 backdrop-blur-xl`}
      >
        {/* Stretched link: seluruh kartu menuju halaman detail tanpa membungkus
            <a> lain di dalamnya (anchor bersarang itu HTML tidak sah). */}
        <Link
          href={`/p/${project.slug}`}
          aria-label={`Lihat detail proyek ${project.title}`}
          className="absolute inset-0 z-0"
        />

        <div className="card-media relative aspect-[16/10] overflow-hidden bg-ink-900">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.url}
              alt={cover.alt || project.title}
              loading={index < 3 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
          ) : (
            /* Tanpa screenshot — lazim untuk proyek internal/NDA. Bukan keadaan
               error, jadi tidak ada ikon rusak: tampilkan blok gradien yang
               justru menonjolkan nama dan tech stack-nya. */
            <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[radial-gradient(120%_120%_at_15%_0%,color-mix(in_oklab,var(--color-violet)_28%,transparent),transparent_60%),linear-gradient(150deg,var(--color-ink-900),var(--color-ink-950))] p-6">
              {/* Garis halus sebagai tekstur, menghindari bidang datar kosong */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 11px)",
                }}
              />

              <span className="eyebrow eyebrow-bright relative">
                {project.techStack.length > 0 ? "Internal / NDA" : "Tanpa pratinjau"}
              </span>

              <span className="display relative text-[clamp(1.5rem,3.4vw,2.5rem)] text-mist-200/90">
                {project.title}
              </span>

              {project.techStack.length > 0 && (
                <span className="eyebrow relative truncate">
                  {project.techStack.slice(0, 4).join(" · ")}
                </span>
              )}
            </div>
          )}

          {/* Gradien penutup lebih tinggi di satu sisi — bukan selubung merata */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(200deg,transparent_35%,var(--color-ink-950)_96%)]" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
            <span className="ghost-index text-[3.25rem] leading-none">{nomor}</span>
            <div className="flex flex-col items-end gap-1.5">
              {project.featured && <span className="eyebrow text-aurora">Unggulan</span>}
              {images.length > 1 && (
                <span className="eyebrow text-mist-400">{images.length} foto</span>
              )}
            </div>
          </div>
        </div>

        {/* pointer-events-none: klik di area teks tembus ke stretched link */}
        <div className="pointer-events-none border-t border-white/8 bg-ink-950/40 px-6 pb-6 pt-5 backdrop-blur-xl">
          <h3 className="display text-[clamp(1.35rem,2.3vw,2rem)] text-mist-200 transition-colors group-hover:text-aurora">
            {project.title}
          </h3>

          <p className="mt-3 line-clamp-2 max-w-prose text-sm leading-relaxed text-mist-400">
            {project.description}
          </p>

          {project.techStack.length > 0 && (
            <p className="eyebrow mt-5 truncate">{project.techStack.slice(0, 4).join(" · ")}</p>
          )}

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-dotted border-white/10 pt-4 text-xs">
            <span className="inline-flex items-center gap-2 font-medium text-aurora">
              Lihat detail
              <span className="transition-transform group-hover:translate-x-1.5">→</span>
            </span>

            {/* pointer-events-auto + z-10: menembus overlay stretched link */}
            <span className="flex items-center gap-4">
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
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}
