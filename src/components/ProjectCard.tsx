"use client";

import { useState } from "react";
import type { ProjectWithImages } from "@/lib/projects";
import { Lightbox } from "./Lightbox";

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
  const [open, setOpen] = useState<number | null>(null);
  const images = project.images;
  const cover = images[0];
  const hasGallery = images.length > 0;

  return (
    <>
      <article
        className="glass card-hover reveal group overflow-hidden rounded-3xl"
        style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
      >
        {/* Klik gambar = buka galeri. Link keluar dipisah ke tombol di bawah. */}
        <button
          type="button"
          onClick={() => hasGallery && setOpen(0)}
          disabled={!hasGallery}
          aria-label={hasGallery ? `Buka galeri ${project.title}` : project.title}
          className="card-media relative block aspect-[16/10] w-full overflow-hidden bg-ink-800 disabled:cursor-default"
        >
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
            <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium tracking-wide text-aurora backdrop-blur-md">
              Unggulan
            </span>
          )}

          {images.length > 1 && (
            <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium text-mist-200 backdrop-blur-md transition-colors group-hover:text-aurora">
              ▦ {images.length} foto
            </span>
          )}

          {hasGallery && (
            <span className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] font-medium text-mist-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Klik untuk lihat galeri
            </span>
          )}
        </button>

        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <h3 className="font-display text-xl font-semibold tracking-tight text-mist-200 transition-colors group-hover:text-aurora">
              {project.title}
            </h3>
            <p className="line-clamp-3 text-sm leading-relaxed text-mist-400">
              {project.description}
            </p>
          </div>

          {/* Strip thumbnail kecil — pratinjau isi galeri tanpa harus membuka */}
          {images.length > 1 && (
            <div className="flex gap-1.5">
              {images.slice(1, 6).map((img, n) => (
                <button
                  key={img.id}
                  onClick={() => setOpen(n + 1)}
                  aria-label={`Buka gambar ${n + 2}`}
                  className="h-10 w-14 shrink-0 overflow-hidden rounded-md border border-white/8 opacity-60 transition-all hover:scale-105 hover:border-aurora/50 hover:opacity-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
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

          {(project.liveUrl || project.repoUrl) && (
            <div className="flex items-center gap-4 pt-1 text-xs font-medium">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-aurora hover:underline"
                >
                  Lihat Live
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mist-400 transition-colors hover:text-mist-200"
                >
                  Source
                </a>
              )}
            </div>
          )}
        </div>
      </article>

      {open !== null && hasGallery && (
        <Lightbox
          images={images}
          title={project.title}
          startAt={open}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
