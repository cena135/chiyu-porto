"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, ProjectImage } from "@prisma/client";
import { Lightbox } from "./Lightbox";

type FullProject = Project & { images: ProjectImage[] };

const TEMA_STYLES: Record<string, { bg: string, border: string, rounded: string, textTitle: string, textDesc: string, textMeta: string, badgeBg: string, btnPrimary: string, btnSecondary: string }> = {
  vanta: {
    bg: "bg-[#05060f]/90", border: "border-white/10", rounded: "rounded-3xl", textTitle: "text-white", textDesc: "text-white/70", textMeta: "text-white/50", badgeBg: "bg-white/5 border-white/10 text-white/80", btnPrimary: "bg-white text-black", btnSecondary: "border border-white/20 text-white hover:bg-white/10"
  },
  neo: {
    bg: "bg-[#ffdd57]/95", border: "border-black border-4", rounded: "rounded-none shadow-[8px_8px_0_0_#000]", textTitle: "text-black", textDesc: "text-black/80", textMeta: "text-black/60", badgeBg: "bg-white border-2 border-black text-black", btnPrimary: "bg-black text-white", btnSecondary: "border-4 border-black bg-white text-black hover:bg-black/5"
  },
  clay: {
    bg: "bg-[#e0e5ec]/95", border: "border-white", rounded: "rounded-[2.5rem] shadow-[8px_8px_16px_#c3c8cf,-8px_-8px_16px_#fdffff]", textTitle: "text-[#3b2f63]", textDesc: "text-[#6b6191]", textMeta: "text-[#6b6191]/70", badgeBg: "bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#c3c8cf,inset_-4px_-4px_8px_#fdffff] text-[#6b6191]", btnPrimary: "bg-[#e0e5ec] text-[#3b2f63] shadow-[4px_4px_8px_#c3c8cf,-4px_-4px_8px_#fdffff]", btnSecondary: "text-[#3b2f63] shadow-[inset_4px_4px_8px_#c3c8cf,inset_-4px_-4px_8px_#fdffff]"
  },
  minimal: {
    bg: "bg-white/95", border: "border-black/5", rounded: "rounded-3xl", textTitle: "text-[#1d1d1f]", textDesc: "text-[#86868b]", textMeta: "text-[#86868b]", badgeBg: "bg-black/5 text-[#86868b]", btnPrimary: "bg-[#1d1d1f] text-white", btnSecondary: "bg-black/5 text-[#1d1d1f] hover:bg-black/10"
  },
  glasslight: {
    bg: "bg-white/60", border: "border-white/40", rounded: "rounded-[2rem] shadow-xl", textTitle: "text-[#0f172a]", textDesc: "text-[#64748b]", textMeta: "text-[#64748b]", badgeBg: "bg-white/50 border border-white/40 text-[#64748b]", btnPrimary: "bg-gradient-to-r from-blue-500 to-purple-500 text-white", btnSecondary: "bg-white/50 border border-white/40 text-[#0f172a] hover:bg-white"
  },
  editorial: {
    bg: "bg-[#f4f4f0]/95", border: "border-black", rounded: "rounded-none", textTitle: "text-[#111] font-serif", textDesc: "text-[#111]/70", textMeta: "text-[#111]/50", badgeBg: "border border-black rounded-none text-[#111]", btnPrimary: "bg-black text-white rounded-none", btnSecondary: "border border-black text-black rounded-none hover:bg-black/5"
  },
  cyber: {
    bg: "bg-black/95", border: "border-[#4ade80]/30", rounded: "rounded-none shadow-[0_0_15px_rgba(74,222,128,0.2)]", textTitle: "text-[#4ade80]", textDesc: "text-[#4ade80]/70", textMeta: "text-[#4ade80]/50", badgeBg: "border border-[#4ade80]/30 text-[#4ade80]", btnPrimary: "bg-[#4ade80] text-black", btnSecondary: "border border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80]/10"
  },
  bento: {
    bg: "bg-[#eef1f6]/95", border: "border-black/10", rounded: "rounded-3xl", textTitle: "text-[#0b1020]", textDesc: "text-[#5b6478]", textMeta: "text-[#5b6478]/70", badgeBg: "bg-white border border-black/10 text-[#5b6478]", btnPrimary: "bg-[#2563eb] text-white hover:bg-[#1d4ed8]", btnSecondary: "bg-white border border-black/10 text-[#0b1020] hover:border-black/20"
  },
};

export function ProjectModal({ project }: { project: FullProject }) {
  const router = useRouter();
  const [buka, setBuka] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [tema, setTema] = useState("vanta");

  useEffect(() => {
    setTema(document.body.getAttribute("data-theme") || "vanta");
  }, []);

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

  const style = TEMA_STYLES[tema] || TEMA_STYLES.vanta;

  return (
    <>
      <AnimatePresence>
        {buka && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden backdrop-blur-xl ${style.bg} ${style.border} ${style.rounded}`}
            >
              {/* Header / Tombol Tutup */}
              <div className={`flex shrink-0 items-center justify-between border-b p-4 sm:px-8 sm:py-5 ${style.border}`}>
                <h2 className={`text-sm font-semibold uppercase tracking-wider ${style.textMeta}`}>
                  Project Details
                </h2>
                <button
                  onClick={close}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${style.badgeBg} hover:opacity-80`}
                  aria-label="Tutup"
                >
                  ✕
                </button>
              </div>

              {/* Konten Scroll */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10">
                <div className={`flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-widest ${style.textMeta}`}>
                  {project.isWip && (
                    <span className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-yellow-500">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-500" />
                      Work in Progress
                    </span>
                  )}
                  {project.featured && <span className="opacity-80">Unggulan</span>}
                  <span>{dibuat}</span>
                </div>

                <h1 className={`mt-4 text-4xl font-bold tracking-tight sm:text-6xl ${style.textTitle}`}>
                  {project.title}
                </h1>

                <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
                  <p className={`text-base leading-relaxed lg:col-span-7 ${style.textDesc}`}>
                    {project.description}
                  </p>

                  {project.techStack.length > 0 && (
                    <dl className="lg:col-span-5">
                      <dt className={`mb-3 text-[11px] font-semibold uppercase tracking-widest ${style.textMeta}`}>
                        Dibangun dengan
                      </dt>
                      <dd className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full ${style.badgeBg}`}
                          >
                            {tech}
                          </span>
                        ))}
                      </dd>
                    </dl>
                  )}
                </div>

                {(project.liveUrl || project.repoUrl) && (
                  <div className={`mt-8 flex flex-wrap items-center gap-3 border-b pb-10 ${style.border}`}>
                    {project.liveUrl && (
                      <a
                         href={project.liveUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-bold transition-transform hover:scale-105 rounded-full ${style.btnPrimary}`}
                      >
                         Kunjungi Website ↗
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                         href={project.repoUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors rounded-full ${style.btnSecondary}`}
                      >
                         Lihat Source Code
                      </a>
                    )}
                  </div>
                )}

                {/* Galeri Gambar */}
                {project.images.length > 0 && (
                  <div className="mt-10">
                    <h3 className={`mb-6 text-[11px] font-semibold uppercase tracking-widest ${style.textMeta}`}>
                      Galeri
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {project.images.map((img, i) => (
                        <button
                          key={img.id}
                          onClick={() => setLightboxIndex(i)}
                          className={`group relative overflow-hidden transition-colors border ${style.border} ${style.rounded} ${
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
                  <div className={`mt-10 p-8 border ${style.border} ${style.badgeBg} ${style.rounded}`}>
                    <h3 className={`mb-4 text-[11px] font-semibold uppercase tracking-widest ${style.textMeta}`}>
                      Catatan
                    </h3>
                    <div className={`space-y-4 text-sm leading-relaxed ${style.textDesc}`}>
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
