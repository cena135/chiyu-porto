"use client";

import Image from "next/image";
import { motion } from "framer-motion";
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
    transition: { type: "spring" as const, stiffness: 90, damping: 18, delay: i * 0.09 },
  }),
};

export function Hero() {
  return (
    <section className="grid grid-cols-1 gap-10 pb-24 pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-36 lg:pt-28">
      <div className="lg:col-span-8">
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

        <h1 className="display text-[clamp(2.75rem,8vw,7.5rem)]">
          {["I Build", "and Host", "Websites."].map((baris, i) => (
            <motion.span
              key={baris}
              custom={i + 1}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className={`block ${i === 0 ? "text-text-dim" : "text-text"}`}
            >
              {baris}
            </motion.span>
          ))}
        </h1>
      </div>

      {/* Kolom meta — sengaja turun dan tidak sejajar dengan judul */}
      <motion.aside
        custom={4}
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="flex flex-col justify-end gap-6 lg:col-span-4 lg:pb-4"
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
            <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
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
            className="rounded-full bg-text px-6 py-3 text-sm font-semibold text-black"
          >
            Lihat Karya
          </motion.a>

          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-text"
          >
            Contact me
          </motion.a>
        </div>
      </motion.aside>
    </section>
  );
}
