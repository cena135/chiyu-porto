"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { ThemeProps, ThemeProject } from "./types";

/**
 * Liquid Glass — kaca tebal melayang di atas aurora.
 *
 * Kartunya dimiringkan mengikuti kursor, dan isinya diangkat di sumbu Z supaya
 * benar-benar MENGAMBANG di atas permukaan kaca. Karena itu pembungkusnya tidak
 * boleh diberi `overflow-hidden`: CSS memaksa `transform-style` kembali ke
 * `flat` begitu overflow bukan `visible`, dan seluruh efek kedalamannya mati
 * tanpa satu pun pesan galat.
 */

const TILT = 10;

function GlassCard({ project, index }: { project: ThemeProject; index: number }) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 150, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 150, damping: 18, mass: 0.4 });

  const rotateX = useTransform(sy, [-0.5, 0.5], [TILT, -TILT]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-TILT, TILT]);

  const miring = useTransform([sx, sy], ([x, y]: number[]) =>
    Math.min(1, (Math.abs(x) + Math.abs(y)) * 2.4),
  );
  const zIsi = useTransform(miring, [0, 1], [10, 36]);

  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const kilau = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.22), transparent 58%)`;

  function gerak(e: React.MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    px.set(nx - 0.5);
    py.set(ny - 0.5);
    gx.set(nx * 100);
    gy.set(ny * 100);
  }

  function keluar() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.article
      initial={{ opacity: 0, x: 60, scale: 0.96 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 100, damping: 16, delay: index * 0.04 }}
      className="group relative"
      style={{ perspective: 1000 }}
    >
      <motion.div
        onMouseMove={gerak}
        onMouseLeave={keluar}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileTap={{ scale: 0.975 }}
        className="glass-liquid relative flex min-h-[15rem] flex-col justify-between rounded-[1.75rem] p-7"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundImage: kilau }}
        />

        <Link href={`/p/${project.slug}`} className="absolute inset-0 z-10" aria-label={project.title} />

        <motion.div className="relative" style={{ z: zIsi, transformStyle: "preserve-3d" }}>
          <span className="text-[11px] tracking-[0.2em] text-white/45">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">{project.title}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/55">
            {project.description}
          </p>
        </motion.div>

        <motion.div
          className="relative mt-6 flex items-center gap-2"
          style={{ z: zIsi, transformStyle: "preserve-3d" }}
        >
          {project.techStack.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-white/60">
              {t}
            </span>
          ))}
          <span
            aria-hidden
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all group-hover:border-[#5eead4]/60 group-hover:text-[#5eead4]"
          >
            →
          </span>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

export function GlassTheme({ projects }: ThemeProps) {
  return (
    <div className="theme-glass relative mx-auto w-full max-w-[86rem] px-6 pb-32 pt-20 sm:px-10">
      {/* Dua noda cahaya dengan ukuran dan posisi yang sengaja TIDAK simetris —
          gradasi yang seimbang sempurna justru terbaca sebagai template. */}
      <div className="aurora-field" aria-hidden />

      <header className="glass-liquid rounded-[2rem] p-8 sm:p-14">
        <span className="text-[11px] uppercase tracking-[0.22em] text-white/45">Liquid Glass</span>
        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.02] tracking-tight text-white">
          Kaca di atas
          <br />
          cahaya.
        </h1>
        <p className="mt-7 max-w-lg text-[15px] leading-relaxed text-white/55">
          Permukaan yang membiaskan aurora di belakangnya. Miringkan kartunya dengan kursor —
          isinya terangkat, bukan ikut berputar rata bersama permukaannya.
        </p>
      </header>

      <section className="pt-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <GlassCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
