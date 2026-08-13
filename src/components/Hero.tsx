"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Spotlight } from "@/components/ui/Spotlight";
import { DotPattern } from "@/components/ui/DotPattern";
import avatar from "../../public/avatar.jpg";

/**
 * Bagian hero — dipisah ke komponen klien supaya `page.tsx` tetap Server
 * Component. Kalau page.tsx sendiri diberi "use client", seluruh query Prisma
 * di dalamnya harus dipindah, dan halaman kehilangan render di server.
 */

const BIO =
  "Hai, aku Alexander Imanuel Joedo (22 tahun), Fullstack developer asal Petra angkatan 22, anak kedua dari dua bersaudara. Aku suka belajar, ngoprek, dan bermain dengan teknologi. If you're interested, feel free to contact me :)";

const META: [string, string][] = [
  ["Basis", "Indonesia"],
  ["Fokus", "Web · Infrastruktur"],
  ["Server", "ThinkPad T480, 24/7"],
];

/**
 * Muncul perlahan dari bawah dengan pegas.
 * `custom` dipakai sebagai penunda beruntun, jadi tiap baris judul masuk
 * berurutan tanpa perlu menulis delay satu per satu.
 */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 18,
      delay: i * 0.09,
    },
  }),
};

/** Judul dipecah per KATA, bukan per huruf.
 *  Per huruf menghasilkan puluhan elemen bertransform sekaligus — di T480 itu
 *  terasa tersendat, dan efek visualnya nyaris tidak berbeda. */
const BARIS = ["I Build", "and Host", "Websites."];

/** Induk hanya mengatur irama; anaknya yang bergerak. */
const wadahJudul = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};

const kataMasuk = {
  hidden: { opacity: 0, y: "0.5em", rotate: 2 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 16 },
  },
};

export function Hero() {
  return (
    <section className="relative grid grid-cols-1 gap-10 pb-24 pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-36 lg:pt-28">
      {/* ---------- Lapisan latar ----------
          Keduanya `absolute` dan berada di belakang konten. Sengaja dibuat
          full-bleed dengan -inset-x supaya teksturnya menembus padding <main>
          dan tidak berhenti mendadak di tepi kolom. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 inset-y-0 -z-10 sm:-inset-x-10"
      >
        <DotPattern />
      </div>

      {/* Spotlight membasuh dari pojok kiri atas ke arah judul */}
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />

      {/* z-10: Spotlight memakai z-[1], tanpa ini cahayanya menimpa teks dan
          kontras judul putih ikut turun. */}
      <div className="relative z-10 lg:col-span-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mb-8 flex items-center gap-4"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-text opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-text" />
          </span>
          <span className="eyebrow">Lagi terima proyek baru</span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={wadahJudul}
          className="display text-[clamp(2.75rem,8vw,7.5rem)]"
        >
          {BARIS.map((baris, i) => {
            const kata = baris.split(" ");
            return (
              <span key={baris} className="block">
                {kata.map((k, j) => (
                  <motion.span
                    key={`${baris}-${j}`}
                    variants={kataMasuk}
                    /**
                     * Gradasi ditempel di KATA, bukan di baris induknya.
                     * `background-clip: text` pada induk akan pecah begitu
                     * anaknya diberi transform — anak bertransform dilukis di
                     * lapisan sendiri dan teksnya bisa jadi tembus pandang.
                     *
                     * inline-block wajib karena elemen inline tidak bisa
                     * ditransform. Jarak antar kata memakai margin, bukan
                     * spasi teks: spasi di antara inline-block tidak andal.
                     */
                    className={[
                      "inline-block will-change-transform",
                      j < kata.length - 1 ? "mr-[0.25em]" : "",
                      i === 0
                        ? "text-text-dim"
                        : i === 2
                          ? "text-gradient"
                          : "text-text",
                    ].join(" ")}
                  >
                    {k}
                  </motion.span>
                ))}
              </span>
            );
          })}
        </motion.h1>
      </div>

      {/* Kolom meta — sengaja turun dan tidak sejajar dengan judul */}
      <motion.aside
        custom={4}
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="relative z-10 flex flex-col justify-end gap-6 lg:col-span-4 lg:pb-4"
      >
        <div className="flex max-w-md items-start gap-5">
          <span className="shrink-0 overflow-hidden rounded-full border border-white/10">
            <Image
              src={avatar}
              alt="Foto Alexander Imanuel Joedo"
              priority
              placeholder="blur"
              // Berkasnya 65 KB dan tampil di bawah 112px. Mengoptimalkan ulang
              // butuh paket `sharp` (~40 MB di image Docker) untuk hasil yang
              // nyaris tak berbeda.
              unoptimized
              className="h-24 w-24 object-cover sm:h-28 sm:w-28"
            />
          </span>

          {/* Ditulis sebagai string JS, bukan teks JSX langsung: apostrof pada
              "you're" akan diprotes aturan lint react/no-unescaped-entities. */}
          <p className="text-sm leading-relaxed text-text-dim">{BIO}</p>
        </div>

        <dl className="space-y-0">
          {META.map(([k, v]) => (
            <div
              key={k}
              className="flex items-baseline justify-between gap-4 py-2.5"
            >
              <dt className="eyebrow shrink-0">{k}</dt>
              <dd className="min-w-0 flex-1 border-b border-dotted border-white/10" />
              <dd className="shrink-0 text-right text-xs text-text">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-3 pt-2">
          <motion.a
            href="#karya"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="rounded-full bg-gradient-to-r from-aurora to-violet px-6 py-3 text-sm font-semibold text-black shadow-[0_10px_40px_-12px_var(--color-aurora)]"
          >
            Lihat Karya
          </motion.a>

          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="glass rounded-full px-6 py-3 text-sm font-medium text-text"
          >
            Contact me
          </motion.a>
        </div>
      </motion.aside>
    </section>
  );
}
