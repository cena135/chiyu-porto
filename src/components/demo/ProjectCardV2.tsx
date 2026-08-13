"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { ProjectWithImages } from "@/lib/projects";
import { useCursor } from "@/components/ui/cursor-store";
import { PALETTES, meshPanel, meshRow } from "./mesh";

/**
 * V2 · Liquid Glass + Aurora.
 *
 * Tilt 3D dibuat EKSTREM (dua kali lipat varian utama) dan glare dipertahankan —
 * di tema inilah kemiringan justru masuk akal, karena permukaan kaca yang
 * miring memang seharusnya memantulkan cahaya secara berbeda.
 */
const TILT_X = 12;
const TILT_Y = 9;

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

export function ProjectCardV2({
  project,
  index = 0,
}: {
  project: ProjectWithImages;
  index?: number;
}) {
  const cover = project.images[0];
  const nomor = String(index + 1).padStart(2, "0");
  const palette = PALETTES[index % PALETTES.length];

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 150, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 150, damping: 18, mass: 0.4 });

  const rotateX = useTransform(sy, [-0.5, 0.5], [TILT_X, -TILT_X]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-TILT_Y, TILT_Y]);

  // Glare dibangun dari motion value lewat useMotionTemplate, bukan state:
  // posisi mouse berubah puluhan kali per detik.
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.22), transparent 55%)`;

  const { setVariant } = useCursor();

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    px.set(nx - 0.5);
    py.set(ny - 0.5);
    gx.set(nx * 100);
    gy.set(ny * 100);
  }

  /** Satu handler untuk dua urusan: kembalikan tilt DAN kecilkan kursor. */
  function handleLeave() {
    px.set(0);
    py.set(0);
    setVariant("default");
  }

  return (
    <motion.article
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="group relative"
      style={{ perspective: 1000 }}
    >
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onMouseEnter={() => setVariant("explore")}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        variants={{ rest: { scale: 1 }, tap: { scale: 0.97 } }}
        initial="rest"
        animate="rest"
        whileTap="tap"
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="glass-liquid radius-modern relative overflow-hidden p-5 sm:p-6"
      >
        {/* Kilau kaca mengikuti kursor */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundImage: glare }}
        />
        <div
          aria-hidden
          data-mesh
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ backgroundImage: meshRow(palette) }}
        />

        <Link
          href={`/p/${project.slug}`}
          aria-label={`Lihat detail proyek ${project.title}`}
          className="absolute inset-0 z-0"
        />

        <div className="pointer-events-none relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
          <span className="eyebrow shrink-0 sm:w-10">{nomor}</span>

          <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-base sm:w-32 lg:w-44">
            {cover ? (
              <motion.img
                src={cover.url}
                alt={cover.alt || project.title}
                loading={index < 3 ? "eager" : "lazy"}
                variants={{ rest: { scale: 1 }, tap: { scale: 1.05 } }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <div
                  aria-hidden
                  data-mesh
                  className="absolute inset-0 scale-105 transition-transform duration-700 group-hover:scale-125"
                  style={{ backgroundImage: meshPanel(palette) }}
                />
                <div aria-hidden className="absolute inset-0 bg-base/35" />
                <span className="absolute inset-0 flex items-center justify-center text-white/70">
                  {IconLock}
                </span>
              </>
            )}
          </div>

          <div className="min-w-0 flex-1 transition-transform duration-500 group-hover:translate-x-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="display text-[clamp(1.2rem,2.6vw,2rem)] text-text-dim transition-colors group-hover:text-aurora">
                {project.title}
              </h3>
              {project.isWip && (
                <span className="rounded-full border border-ember/40 bg-ember/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-ember">
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-text-dim transition-all group-hover:border-aurora/50 group-hover:bg-aurora/10 group-hover:text-aurora"
          >
            →
          </span>
        </div>
      </motion.div>
    </motion.article>
  );
}
