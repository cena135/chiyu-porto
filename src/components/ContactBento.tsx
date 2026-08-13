"use client";

import { motion } from "framer-motion";
import { Tooltip } from "@/components/ui/Tooltip";

/**
 * Tiga kanal kontak sebagai kotak bento.
 *
 * Bentuknya sengaja sama persis dengan kotak proyek di atasnya — kontak adalah
 * bagian dari grid yang sama, bukan footer yang ditempel belakangan.
 */

const BLUE = "#2563EB";
const PURPLE = "#7C3AED";

const ikon = "h-[18px] w-[18px]";

const IconMail = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={ikon}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="m3 7 8.2 5.6a1.4 1.4 0 0 0 1.6 0L21 7" strokeLinecap="round" />
  </svg>
);

const IconInstagram = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={ikon}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const IconWhatsApp = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={ikon}>
    <path d="M3.8 20.2l1.2-4a8 8 0 1 1 3 3l-4.2 1z" strokeLinejoin="round" />
    <path
      d="M9 8.6c.3-.1.6 0 .8.3l.7 1.2c.1.3.1.6-.1.8l-.5.5a5.4 5.4 0 0 0 2.7 2.7l.5-.5c.2-.2.5-.2.8-.1l1.2.7c.3.2.4.5.3.8-.3.9-1.2 1.4-2.1 1.2A7.4 7.4 0 0 1 7.8 10c-.2-.9.3-1.8 1.2-2.1z"
      strokeLinejoin="round"
    />
  </svg>
);

const KONTAK = [
  {
    label: "Email",
    tampil: "alexanderjoedo@gmail.com",
    petunjuk: "Buka jendela tulis Gmail",
    // Buka jendela tulis Gmail di web, bukan mailto: — banyak orang tidak punya
    // aplikasi email terpasang, dan mailto pada mereka tidak melakukan apa-apa.
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=alexanderjoedo@gmail.com",
    icon: IconMail,
    warna: BLUE,
  },
  {
    label: "Instagram",
    tampil: "@alexander_joedo",
    petunjuk: "Buka profil Instagram",
    href: "https://instagram.com/alexander_joedo",
    icon: IconInstagram,
    warna: PURPLE,
  },
  {
    label: "WhatsApp",
    tampil: "081252729777",
    petunjuk: "Mulai obrolan WhatsApp",
    // Nomor dipakai dalam format internasional (62...) karena wa.me menolak awalan 0.
    href: "https://wa.me/6281252729777?text=Hai%20alex%2C%20aku%20tertarik%20untuk%20diskusi%20projek",
    icon: IconWhatsApp,
    warna: BLUE,
  },
];

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

export function ContactBento() {
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
        {KONTAK.map(({ label, tampil, href, icon, warna, petunjuk }, i) => (
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
                  {icon}
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
        ))}
      </div>
    </section>
  );
}
