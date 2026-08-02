"use client";

import { useState } from "react";
import type { ProjectImage } from "@prisma/client";
import { Lightbox } from "./Lightbox";

/** Galeri di halaman detail: kotak besar untuk cover, sisanya grid. Klik = lightbox. */
export function ProjectGallery({ images, title }: { images: ProjectImage[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);

  if (images.length === 0) return null;

  const [cover, ...rest] = images;

  return (
    <>
      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setOpen(0)}
          aria-label={`Perbesar ${title} — gambar 1`}
          className="glass card-hover group block w-full overflow-hidden rounded-3xl"
        >
          <div className="card-media relative aspect-[16/9] overflow-hidden bg-ink-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover.url}
              alt={cover.alt || title}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
            <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/50 px-4 py-1.5 text-[11px] text-mist-200 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
              Klik untuk perbesar
            </span>
          </div>
        </button>

        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rest.map((img, n) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setOpen(n + 1)}
                aria-label={`Perbesar ${title} — gambar ${n + 2}`}
                className="glass card-hover group overflow-hidden rounded-2xl"
              >
                <div className="card-media relative aspect-[4/3] overflow-hidden bg-ink-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || `${title} — gambar ${n + 2}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {open !== null && (
        <Lightbox images={images} title={title} startAt={open} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
