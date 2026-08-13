"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProjectImage } from "@prisma/client";

export function Lightbox({
  images,
  title,
  startAt,
  onClose,
}: {
  images: ProjectImage[];
  title: string;
  startAt: number;
  onClose: () => void;
}) {
  const [i, setI] = useState(startAt);

  const prev = useCallback(
    () => setI((n) => (n - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setI((n) => (n + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    // Kunci scroll halaman selama lightbox terbuka.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  const current = images[i];
  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galeri ${title}`}
      onClick={onClose}
      className="modal-backdrop fixed inset-0 z-50 flex flex-col items-center justify-center bg-base/85 p-4 backdrop-blur-xl sm:p-8"
    >
      <div className="flex w-full max-w-5xl items-center justify-between pb-4">
        <div className="min-w-0">
          <p className="font-display truncate text-sm font-semibold text-text">
            {title}
          </p>
          <p className="text-xs text-text-dim">
            {i + 1} / {images.length}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Tutup galeri"
          className="bento rounded-full px-4 py-2 text-xs text-text transition-colors hover:text-text"
        >
          Tutup ✕
        </button>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-panel relative flex w-full max-w-5xl flex-1 items-center justify-center"
      >
        {images.length > 1 && (
          <button
            onClick={prev}
            aria-label="Gambar sebelumnya"
            className="bento absolute left-2 z-10 h-11 w-11 rounded-full text-text transition-all hover:scale-110 hover:text-text"
          >
            ‹
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.id}
          src={current.url}
          alt={current.alt || `${title} — gambar ${i + 1}`}
          className="media-swap max-h-[70vh] w-auto max-w-full rounded-2xl border border-line object-contain shadow-2xl"
        />

        {images.length > 1 && (
          <button
            onClick={next}
            aria-label="Gambar berikutnya"
            className="bento absolute right-2 z-10 h-11 w-11 rounded-full text-text transition-all hover:scale-110 hover:text-text"
          >
            ›
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1"
        >
          {images.map((img, n) => (
            <button
              key={img.id}
              onClick={() => setI(n)}
              aria-label={`Ke gambar ${n + 1}`}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-all ${
                n === i
                  ? "border-text opacity-100"
                  : "border-line opacity-50 hover:opacity-90"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
