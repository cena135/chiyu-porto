"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProjectWithImages } from "@/lib/projects";
import { Marquee } from "@/components/ui/Marquee";
import avatar from "../../public/avatar.jpg";

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

/* Ditulis sebagai string JS, bukan teks JSX langsung: apostrof pada "you're"
   akan diprotes aturan lint react/no-unescaped-entities. */
const BIO =
  "Hai, aku Alexander Imanuel Joedo (22 tahun), Fullstack developer asal Petra angkatan 22, anak kedua dari dua bersaudara. Aku suka belajar, ngoprek, dan bermain dengan teknologi. If you're interested, feel free to contact me :)";

const META: [string, string][] = [
  ["Basis", "Indonesia"],
  ["Fokus", "Web · Infrastruktur"],
  ["Server", "ThinkPad T480, 24/7"],
];

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
  // Diambil dari proyek yang benar-benar ada, jadi daftarnya tidak pernah
  // berbohong. Kalau database masih kosong, barulah dipakai daftar dasar.
  const dariProyek = [...new Set(projects.flatMap((p) => p.techStack))];
  const stack =
    dariProyek.length > 0
      ? dariProyek
      : ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind", "Docker"];

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
            {/* Status ketersediaan — titik berdenyut, bukan sekadar teks */}
            <div className="mb-7 flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full"
                  style={{ background: BLUE }}
                  variants={{ hover: { background: "#ffffff" } }}
                  animate={{ opacity: [0.5, 0, 0.5], scale: [1, 2.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ background: BLUE }}
                  variants={{ hover: { background: "#ffffff" } }}
                  transition={pegas}
                />
              </span>
              <motion.span
                className="eyebrow"
                variants={{ hover: { color: "rgba(255,255,255,0.85)" } }}
                transition={{ duration: 0.3 }}
              >
                Lagi terima proyek baru
              </motion.span>
            </div>

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

            {/* Wajah + bio CEO. Foto sengaja di samping teks, bukan di atasnya:
                pada kotak selebar ini, foto yang ditumpuk memaksa bio turun
                sampai keluar dari lipatan layar. */}
            <div className="mt-8 flex max-w-xl flex-col gap-5 sm:flex-row sm:items-start">
              <motion.span
                className="block shrink-0 overflow-hidden rounded-2xl"
                variants={{ hover: { scale: 1.05, rotate: -2 } }}
                whileHover={{ scale: 1.05 }}
                transition={pegas}
              >
                <Image
                  src={avatar}
                  alt="Foto Alexander Imanuel Joedo"
                  priority
                  placeholder="blur"
                  // Berkasnya 65 KB dan tampil di bawah 112px. Mengoptimalkan
                  // ulang butuh paket `sharp` (~40 MB di image Docker) untuk
                  // hasil yang nyaris tak berbeda.
                  unoptimized
                  className="h-24 w-24 object-cover sm:h-28 sm:w-28"
                />
              </motion.span>

              <motion.p
                className="text-sm leading-relaxed text-text-dim"
                variants={{ hover: { color: "rgba(255,255,255,0.9)" } }}
                transition={{ duration: 0.3 }}
              >
                {BIO}
              </motion.p>
            </div>

            {/* Meta bertitik-titik — jangkar visual yang menahan kotak besar
                supaya tidak terasa kosong di bawah bio. */}
            <dl className="mt-7 max-w-md">
              {META.map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-4 py-2">
                  <motion.dt
                    className="eyebrow shrink-0"
                    variants={{ hover: { color: "rgba(255,255,255,0.75)" } }}
                    transition={{ duration: 0.3 }}
                  >
                    {k}
                  </motion.dt>
                  <motion.dd
                    className="min-w-0 flex-1 border-b border-dotted border-line-strong"
                    variants={{ hover: { borderColor: "rgba(255,255,255,0.4)" } }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.dd
                    className="shrink-0 text-right text-xs font-medium"
                    variants={{ hover: { color: "#ffffff" } }}
                    transition={{ duration: 0.3 }}
                  >
                    {v}
                  </motion.dd>
                </div>
              ))}
            </dl>

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

        {/* ---------- Kotak sedang 1: tech stack berjalan ---------- */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="show"
          variants={masuk}
          className="bento relative flex flex-col justify-center gap-4 overflow-hidden rounded-3xl px-0 py-8"
        >
          {/* Kotak ini TIDAK memakai `whileHover` bersama seperti tetangganya:
              marquee-nya berhenti saat disorot supaya bisa dibaca, dan latar
              yang ikut menyapu warna justru menutupi isinya. */}
          <p className="eyebrow px-8">Dibangun dengan</p>
          <Marquee items={stack} durasi={24} />
          <Marquee items={[...stack].reverse()} durasi={30} />
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
      {/* Kotak proyek. Keadaan kosong ditangani DI SINI, bukan dengan
          mengganti seluruh grid: profil dan kontak harus tetap tampil walau
          database sedang tidak bisa dihubungi. */}
      {projects.length === 0 ? (
        <div id="karya" className="bento mt-4 scroll-mt-24 rounded-3xl px-8 py-16 text-center">
          <p className="display text-2xl">Belum ada apa-apa di sini.</p>
          <p className="mt-3 text-sm text-text-dim">
            Masuk ke{" "}
            <Link
              href="/admin"
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              panel admin
            </Link>{" "}
            untuk menambahkan proyek pertama.
          </p>
        </div>
      ) : (
        /* Tiga kolom, bukan empat: dengan 8 proyek, empat kolom hanya
           menghasilkan dua baris pendek. Tiga kolom memberi tiga baris, dan
           jarak antar kotak yang lebar itulah yang membuat area ini terasa
           panjang saat digulir. */
        <div
        id="karya"
        className="mt-12 grid scroll-mt-28 grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-12"
      >
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            custom={i + 4}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={masuk}
            whileHover="hover"
            className="bento group relative flex min-h-[19rem] flex-col overflow-hidden rounded-3xl p-7 md:min-h-[23rem]"
          >
            <motion.div
              aria-hidden
              className="absolute inset-0"
              style={{ background: i % 2 === 0 ? BLUE : PURPLE }}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 0 }, hover: { opacity: 1 } }}
              transition={{ duration: 0.35 }}
            />
            <Link href={`/p/${p.slug}`} className="absolute inset-0 z-10" aria-label={p.title} />

            {/* `flex-1` + `justify-between`: nomor menempel di atas, judul dan
                panah turun ke dasar. Tanpa ini, kotak yang ditinggikan hanya
                menyisakan ruang kosong menganga di bawah teks. */}
            <div className="relative flex flex-1 flex-col justify-between">
              <motion.span
                className="eyebrow"
                variants={{ hover: { color: "rgba(255,255,255,0.8)" } }}
                transition={{ duration: 0.3 }}
              >
                {String(i + 1).padStart(2, "0")}
              </motion.span>

              <div className="mt-8">
              <motion.h3
                className="display mt-3 text-xl font-bold"
                variants={{ hover: { color: "#ffffff", x: 4 } }}
                transition={pegas}
              >
                {p.title}
              </motion.h3>

              <motion.p
                className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-dim"
                variants={{ hover: { color: "rgba(255,255,255,0.85)" } }}
                transition={{ duration: 0.3 }}
              >
                {p.description}
              </motion.p>

              <motion.span
                className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{ background: i % 2 === 0 ? BLUE : PURPLE }}
                variants={{ hover: { background: "#ffffff", color: i % 2 === 0 ? BLUE : PURPLE, scale: 1.15 } }}
                transition={pegas}
              >
                →
              </motion.span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
}
