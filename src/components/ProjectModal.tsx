"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, ProjectImage } from "@prisma/client";
import { Lightbox } from "./Lightbox";

type FullProject = Project & { images: ProjectImage[] };

export function ProjectModal({ project }: { project: FullProject }) {
  const router = useRouter();
  const [buka, setBuka] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Tutup dengan Escape
  useEffect(() => {
    const tekanEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && lightboxIndex === null) close();
    };
    document.addEventListener("keydown", tekanEsc);
    return () => document.removeEventListener("keydown", tekanEsc);
  }, [lightboxIndex]);

  // Hindari scroll body saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function close() {
    setBuka(false);
    setTimeout(() => {
      router.back();
    }, 300);
  }

  const dibuat = new Date(project.createdAt).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
  });

  return (
    <>
      <AnimatePresence>
        {buka && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]/90 shadow-2xl backdrop-blur-xl"
            >
              {/* Header / Tombol Tutup */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-4 sm:px-8 sm:py-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
                  Project Details
                </h2>
                <button
                  onClick={close}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Tutup"
                >
                  ✕
                </button>
              </div>

              {/* Konten Scroll */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-widest text-white/50">
                  {project.isWip && (
                    <span className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-yellow-500">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-500" />
                      Work in Progress
                    </span>
                  )}
                  {project.featured && <span className="text-white/80">Unggulan</span>}
                  <span>{dibuat}</span>
                </div>

                <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  {project.title}
                </h1>

                <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
                  <p className="text-base leading-relaxed text-white/70 lg:col-span-7">
                    {project.description}
                  </p>

                  {project.techStack.length > 0 && (
                    <dl className="lg:col-span-5">
                      <dt className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/50">
                        Dibangun dengan
                      </dt>
                      <dd className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80"
                          >
                            {tech}
                          </span>
                        ))}
                      </dd>
                    </dl>
                  )}
                </div>

                {(project.liveUrl || project.repoUrl) && (
                  <div className="mt-8 flex flex-wrap items-center gap-3 border-b border-white/10 pb-10">
                    {project.liveUrl && (
                      <a
                         href={project.liveUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
                      >
                         Kunjungi Website ↗
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                         href={project.repoUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                      >
                         Lihat Source Code
                      </a>
                    )}
                  </div>
                )}

                {/* Galeri Gambar */}
                {project.images.length > 0 && (
                  <div className="mt-10">
                    <h3 className="mb-6 text-[11px] font-semibold uppercase tracking-widest text-white/50">
                      Galeri
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {project.images.map((img, i) => (
                        <button
                          key={img.id}
                          onClick={() => setLightboxIndex(i)}
                          className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-white/30 ${
                            i === 0 ? "sm:col-span-2 aspect-[21/9]" : "aspect-[4/3]"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.alt || `${project.title} - ${i + 1}`}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                            <span className="rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                              Perbesar
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Catatan Panjang */}
                {project.content && (
                  <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">
                    <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-white/50">
                      Catatan
                    </h3>
                    <div className="space-y-4 text-sm leading-relaxed text-white/80">
                      {project.content.split(/\n\s*\n/).map((paragraf, i) => (
                        <p key={i} className="whitespace-pre-line">
                          {paragraf}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {lightboxIndex !== null && (
        <Lightbox
          images={project.images}
          startAt={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          title={project.title}
        />
      )}
    </>
  );
}
