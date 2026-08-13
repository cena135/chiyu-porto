"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ProjectWithImages } from "@/lib/projects";

/**
 * Identitas warna per proyek untuk baris tanpa screenshot.
 *
 * Dipilih lewat `index % PALETTES.length`, bukan hash judul: cara ini MENJAMIN
 * dua baris bersebelahan tidak pernah kembar warnanya.
 *
 * Alpha tiap warna rendah dan masih ditumpuk peredam gelap — warnanya terbaca
 * sebagai cahaya yang dipantulkan kaca, bukan sebagai bidang cat.
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

/** Rotasi maksimum. Sengaja lebih kecil dari 10 derajat: baris ini selebar
 *  layar, dan pada bidang selebar itu 10 derajat terbaca sebagai miring rusak,
 *  bukan sebagai kedalaman. */
const TILT_X = 6;
const TILT_Y = 4;

export function ProjectCard({
  project,
  index = 0,
}: {
  project: ProjectWithImages;
  index?: number;
}) {
  const cover = project.images[0];
  const nomor = String(index + 1).padStart(2, "0");
  const palette = PALETTES[index % PALETTES.length];

  /* ---------- Tilt 3D mengikuti kursor ----------
     Posisi kursor dinormalkan ke -0.5..0.5, lalu dipetakan ke derajat rotasi.
     useSpring meredam nilainya supaya kartu tidak mematuk mengikuti tiap piksel
     gerakan mouse — peredam inilah yang membuatnya terasa berbobot. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const sx = useSpring(px, { stiffness: 150, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 150, damping: 18, mass: 0.4 });

  const rotateX = useTransform(sy, [-0.5, 0.5], [TILT_X, -TILT_X]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-TILT_Y, TILT_Y]);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }

  function handleLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.article
      data-motion-card
      /* Masuk meluncur DARI KANAN dengan pantulan pegas. Dipisah dari elemen
         tilt: menaruh animate (x/scale) dan motion value (rotateX/rotateY) di
         satu elemen membuat keduanya berebut properti transform yang sama. */
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="group relative border-t border-white/8 last:border-b"
      style={{ perspective: 1000 }}
    >
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        /* Amblas saat ditekan. Tidak mengganggu Link: whileTap hanya mengubah
           transform, sedangkan tautannya tetap menerima pointer event. */
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative"
      >
        {/* Sapuan aurora sepanjang baris — 0 saat diam, muncul halus saat disorot */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ backgroundImage: meshRow(palette) }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-base/55 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <Link
          href={`/p/${project.slug}`}
          aria-label={`Lihat detail proyek ${project.title}`}
          className="absolute inset-0 z-0"
        />

        <div className="pointer-events-none relative flex flex-col gap-5 px-1 py-7 sm:flex-row sm:items-center sm:gap-7 sm:py-8">
          <span className="eyebrow shrink-0 sm:w-10">{nomor}</span>

          {/* Panel gambar — ramping, mengikuti bentuk baris */}
          <div className="card-media radius-modern relative h-24 w-full shrink-0 overflow-hidden border border-white/8 bg-surface sm:h-20 sm:w-36 lg:h-24 lg:w-48">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover.url}
                alt={cover.alt || project.title}
                loading={index < 3 ? "eager" : "lazy"}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              /* Tanpa screenshot — lazim untuk proyek internal/NDA.
               Tiap baris dapat mesh gradient sendiri supaya deretannya tidak
               terbaca monoton, tetap diredam agar bernuansa gelap. */
              <>
                <div
                  aria-hidden
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

          {/* Teks — bergeser sedikit saat baris disorot */}
          <div className="min-w-0 flex-1 transition-transform duration-500 group-hover:translate-x-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="display text-[clamp(1.35rem,3vw,2.4rem)] text-text-dim transition-colors group-hover:text-aurora">
                {project.title}
              </h3>
              {project.isWip && (
                <span className="rounded-full border border-ember/40 bg-ember/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-ember">
                  WIP
                </span>
              )}
              {project.featured && (
                <span className="eyebrow text-aurora">Unggulan</span>
              )}
              {!cover && <span className="eyebrow">Internal</span>}
            </div>

            <p className="mt-2 line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-text-dim sm:line-clamp-1">
              {project.description}
            </p>
          </div>

          {/* Tech stack — sembunyi di layar sempit supaya baris tetap padat */}
          {project.techStack.length > 0 && (
            <p className="eyebrow hidden max-w-[13rem] shrink-0 truncate text-right lg:block">
              {project.techStack.slice(0, 3).join(" · ")}
            </p>
          )}

          <div className="flex shrink-0 items-center gap-4">
            <span className="flex items-center gap-3 text-[11px]">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto relative z-10 text-text-dim transition-colors hover:text-text"
                >
                  Live ↗
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto relative z-10 text-text-dim transition-colors hover:text-text"
                >
                  Source
                </a>
              )}
            </span>

            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-text-dim transition-all group-hover:border-aurora/50 group-hover:bg-aurora/10 group-hover:text-aurora"
            >
              <span className="-translate-x-1 opacity-70 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                →
              </span>
            </span>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}
