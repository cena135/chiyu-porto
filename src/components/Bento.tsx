"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ProjectWithImages } from "@/lib/projects";

/**
 * Vibrant Bento Grid — tata letak utama situs.
 *
 * Tata letak asimetris: satu kotak besar di kiri, dua kotak sedang di kanan,
 * lalu deretan kotak proyek. Di layar sempit SEMUANYA jatuh jadi satu kolom —
 * bento yang dipaksa tetap dua kolom di ponsel menghasilkan kotak sempit yang
 * teksnya pecah.
 */

const BLUE = "#2563EB";
const PURPLE = "#7C3AED";

/** Muncul beruntun; `custom` dipakai sebagai penunda per kotak. */
const masuk = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 110, damping: 16, delay: i * 0.06 },
  }),
};

/** Satu sumber untuk transisi hover semua kotak, supaya iramanya seragam. */
const pegas = { type: "spring" as const, stiffness: 320, damping: 22 };

export function Bento({ projects }: { projects: ProjectWithImages[] }) {
  return (
    <div className="pb-10 pt-4">
      {/* 1 kolom di ponsel, 3 kolom sejak layar sedang */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
        {/* ---------- Kotak besar: judul + CTA ---------- */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="show"
          variants={masuk}
          whileHover="hover"
          className="bento group relative overflow-hidden rounded-3xl p-8 md:col-span-2 md:row-span-2 md:p-12"
        >
          {/* Latar warna menyapu masuk saat disorot — inilah perubahan drastis
              yang diminta, tanpa mengganti warna teks secara mendadak. */}
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})` }}
            variants={{ hidden: { opacity: 0 }, show: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.35 }}
          />

          <div className="relative">
            <motion.h1
              className="display text-[clamp(2.25rem,5.5vw,4.5rem)] font-bold"
              variants={{ hover: { color: "#ffffff" } }}
              transition={pegas}
            >
              I Build
              <br />
              and Host
              <br />
              <motion.span
                className="inline-block"
                style={{ color: BLUE }}
                variants={{ hover: { color: "#ffffff", x: 8 } }}
                transition={pegas}
              >
                Websites.
              </motion.span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-md text-sm leading-relaxed text-text-dim"
              variants={{ hover: { color: "rgba(255,255,255,0.9)" } }}
              transition={{ duration: 0.3 }}
            >
              Fullstack developer yang menjalankan semuanya sendiri — dari kode sampai server
              fisik di pojok kamar.
            </motion.p>

            <motion.a
              href="#karya"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
              style={{ background: BLUE }}
              variants={{ hover: { scale: 1.08, background: "#ffffff", color: BLUE } }}
              whileTap={{ scale: 0.95 }}
              transition={pegas}
            >
              Lihat Karya
              <motion.span variants={{ hover: { x: 6 } }} transition={pegas}>
                →
              </motion.span>
            </motion.a>
          </div>
        </motion.div>

        {/* ---------- Kotak sedang 1: jumlah proyek ---------- */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="show"
          variants={masuk}
          whileHover="hover"
          className="bento group relative overflow-hidden rounded-3xl p-8"
        >
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{ background: PURPLE }}
            variants={{ hidden: { opacity: 0 }, show: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.35 }}
          />
          <div className="relative">
            <motion.p
              className="display text-6xl font-bold"
              style={{ color: PURPLE }}
              variants={{ hover: { color: "#ffffff", scale: 1.1, originX: 0 } }}
              transition={pegas}
            >
              {projects.length}
            </motion.p>
            <motion.p
              className="eyebrow mt-3"
              variants={{ hover: { color: "rgba(255,255,255,0.85)" } }}
              transition={{ duration: 0.3 }}
            >
              Proyek dipublikasikan
            </motion.p>
          </div>
        </motion.div>

        {/* ---------- Kotak sedang 2: kontak ---------- */}
        <motion.a
          href="#contact"
          custom={3}
          initial="hidden"
          animate="show"
          variants={masuk}
          whileHover="hover"
          whileTap={{ scale: 0.98 }}
          className="bento group relative flex flex-col justify-between overflow-hidden rounded-3xl p-8"
        >
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{ background: `linear-gradient(200deg, ${PURPLE}, ${BLUE})` }}
            variants={{ hidden: { opacity: 0 }, show: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.35 }}
          />
          <motion.p
            className="display relative text-2xl font-bold"
            variants={{ hover: { color: "#ffffff" } }}
            transition={pegas}
          >
            Punya ide?
          </motion.p>
          <motion.span
            className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: BLUE }}
            variants={{ hover: { color: "#ffffff" } }}
            transition={pegas}
          >
            Hubungi saya
            <motion.span variants={{ hover: { x: 8, rotate: -45 } }} transition={pegas}>
              →
            </motion.span>
          </motion.span>
        </motion.a>
      </div>

      {/* ---------- Deret kotak proyek ---------- */}
      <div id="karya" className="mt-4 scroll-mt-24 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            custom={i + 4}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={masuk}
            whileHover="hover"
            className="bento group relative overflow-hidden rounded-3xl p-6"
          >
            <motion.div
              aria-hidden
              className="absolute inset-0"
              style={{ background: i % 2 === 0 ? BLUE : PURPLE }}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 0 }, hover: { opacity: 1 } }}
              transition={{ duration: 0.35 }}
            />
            <Link href={`/p/${p.slug}`} className="absolute inset-0 z-10" aria-label={p.title} />

            <div className="relative">
              <motion.span
                className="eyebrow"
                variants={{ hover: { color: "rgba(255,255,255,0.8)" } }}
                transition={{ duration: 0.3 }}
              >
                {String(i + 1).padStart(2, "0")}
              </motion.span>

              <motion.h3
                className="display mt-3 text-xl font-bold"
                variants={{ hover: { color: "#ffffff", x: 4 } }}
                transition={pegas}
              >
                {p.title}
              </motion.h3>

              <motion.p
                className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-text-dim"
                variants={{ hover: { color: "rgba(255,255,255,0.85)" } }}
                transition={{ duration: 0.3 }}
              >
                {p.description}
              </motion.p>

              <motion.span
                className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-white"
                style={{ background: i % 2 === 0 ? BLUE : PURPLE }}
                variants={{ hover: { background: "#ffffff", color: i % 2 === 0 ? BLUE : PURPLE, scale: 1.15 } }}
                transition={pegas}
              >
                →
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
