"use client";

import { motion } from "framer-motion";
import { Tooltip } from "@/components/ui/Tooltip";
import { IkonKontak } from "@/components/themes/ThemeSections";
import type { KontakItem } from "@/lib/site-data";

/**
 * Tiga kanal kontak sebagai kotak bento.
 *
 * Bentuknya sengaja sama persis dengan kotak proyek di atasnya — kontak adalah
 * bagian dari grid yang sama, bukan footer yang ditempel belakangan.
 */

const BLUE = "#2563EB";
const PURPLE = "#7C3AED";


const masuk = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 110, damping: 16, delay: i * 0.06 },
  }),
};

const pegas = { type: "spring" as const, stiffness: 320, damping: 22 };

export function ContactBento({ kontak }: { kontak: KontakItem[] }) {
  return (
    /* Blok kontak sengaja setinggi hampir satu layar penuh dan isinya
       dipusatkan secara vertikal. Tujuannya bukan sekadar lega: saat tautan
       jangkar mendarat di sini, deret proyek di atasnya harus terdorong keluar
       layar sepenuhnya — kalau tingginya pas-pasan, pengguna melihat separuh
       kartu proyek yang menggantung di tepi atas dan tujuan gulirnya jadi
       ambigu.

       85svh, bukan 85vh: di ponsel, `vh` mengukur layar TANPA bilah alamat,
       jadi blok ini akan lebih tinggi dari ruang yang benar-benar terlihat dan
       isinya tetap terpotong. `svh` memakai ukuran terkecil, yang justru
       dijamin muat. */
    <section
      id="contact"
      className="mt-16 flex min-h-[85svh] scroll-mt-20 flex-col justify-center py-12 md:mt-24"
    >
      {/* Judul menahan ruang besar ini supaya tidak terbaca sebagai halaman
          kosong dengan tiga kartu yang mengambang di tengahnya. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: "spring", stiffness: 110, damping: 16 }}
        className="mb-10 text-center"
      >
        <span className="eyebrow">Kontak</span>
        <p className="display mt-4 text-[clamp(2rem,5vw,3.5rem)]">
          Punya ide? <span className="text-gradient">Contact me</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3 md:gap-8">
        {kontak.map(({ label, tampil, href, petunjuk, ikon }, i) => {
          const warna = i === 1 ? PURPLE : BLUE;
          return (
          <motion.a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={petunjuk}
            custom={i}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={masuk}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            className="bento group relative flex min-h-[8.5rem] items-center overflow-hidden rounded-3xl p-7"
          >
            <motion.div
              aria-hidden
              className="absolute inset-0"
              style={{ background: warna }}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 0 }, hover: { opacity: 1 } }}
              transition={{ duration: 0.35 }}
            />

            <div className="relative flex w-full items-center gap-4">
              {/* Aturan Emas UI no. 4: ikon tanpa teks wajib punya penjelas
                  saat disorot. `title` tetap dipasang di tautannya sebagai
                  cadangan kalau JavaScript mati. */}
              <Tooltip label={petunjuk}>
                <motion.span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: warna }}
                  variants={{ hover: { background: "#ffffff", color: warna, scale: 1.12, rotate: -8 } }}
                  transition={pegas}
                >
                  <IkonKontak nama={ikon} />
                </motion.span>
              </Tooltip>

              <div className="min-w-0">
                <motion.span
                  className="eyebrow block"
                  variants={{ hover: { color: "rgba(255,255,255,0.8)" } }}
                  transition={{ duration: 0.3 }}
                >
                  {label}
                </motion.span>
                <motion.span
                  className="block truncate text-sm font-semibold"
                  variants={{ hover: { color: "#ffffff", x: 4 } }}
                  transition={pegas}
                >
                  {tampil}
                </motion.span>
              </div>

              <motion.span
                aria-hidden
                className="ml-auto shrink-0 text-sm font-semibold"
                style={{ color: warna }}
                variants={{ hover: { color: "#ffffff", x: 6, rotate: -45 } }}
                transition={pegas}
              >
                →
              </motion.span>
            </div>
          </motion.a>
          );
        })}
      </div>
    </section>
  );
}
