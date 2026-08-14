"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { KontakItem, Profil } from "@/lib/site-data";

/**
 * Blok profil dan kontak yang dipakai bersama SEMBILAN tema.
 *
 * Markupnya sama, gayanya tidak: tiap tema mengoper kelasnya sendiri lewat
 * `kelas`. Alternatifnya adalah menyalin struktur yang sama sembilan kali, dan
 * itu berarti sembilan tempat yang harus diingat setiap kali ada satu baris
 * yang berubah.
 */

const IKON: Record<KontakItem["ikon"], React.ReactNode> = {
  mail: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 7 8.2 5.6a1.4 1.4 0 0 0 1.6 0L21 7" strokeLinecap="round" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3.8 20.2l1.2-4a8 8 0 1 1 3 3l-4.2 1z" strokeLinejoin="round" />
      <path
        d="M9 8.6c.3-.1.6 0 .8.3l.7 1.2c.1.3.1.6-.1.8l-.5.5a5.4 5.4 0 0 0 2.7 2.7l.5-.5c.2-.2.5-.2.8-.1l1.2.7c.3.2.4.5.3.8-.3.9-1.2 1.4-2.1 1.2A7.4 7.4 0 0 1 7.8 10c-.2-.9.3-1.8 1.2-2.1z"
        strokeLinejoin="round"
      />
    </>
  ),
};

export function IkonKontak({ nama, className = "h-[18px] w-[18px]" }: {
  nama: KontakItem["ikon"];
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      {IKON[nama]}
    </svg>
  );
}

/** Foto + bio + meta. `kelas.foto` mengatur bentuk fotonya (bulat, kotak,
 *  bersudut) — itu satu-satunya bagian yang benar-benar berbeda antar tema. */
export function ProfilBlok({
  profil,
  kelas = {},
}: {
  profil: Profil;
  kelas?: { wadah?: string; foto?: string; bio?: string; garis?: string; nilai?: string; tombol?: string };
}) {
  return (
    <div className={kelas.wadah ?? "mt-8 flex max-w-xl flex-col gap-5 sm:flex-row sm:items-start"}>
      <motion.span
        className={`block shrink-0 overflow-hidden ${kelas.foto ?? "rounded-2xl"}`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
      >
        <Image
          src={profil.avatar}
          alt={`Foto ${profil.nama}`}
          priority
          placeholder="blur"
          // Berkasnya 65 KB dan tampil di bawah 112px. Mengoptimalkan ulang
          // butuh paket `sharp` (~40 MB di image Docker) untuk hasil yang
          // nyaris tak berbeda.
          unoptimized
          className="h-24 w-24 object-cover sm:h-28 sm:w-28"
        />
      </motion.span>

      <div className="min-w-0">
        <p className={kelas.bio ?? "text-sm leading-relaxed opacity-70"}>{profil.bio}</p>

        <dl className="mt-6 max-w-md">
          {profil.meta.map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-4 py-1.5">
              <dt className="eyebrow shrink-0">{k}</dt>
              <dd className={`min-w-0 flex-1 border-b border-dotted ${kelas.garis ?? "border-current/25"}`} />
              <dd className={`shrink-0 text-right text-xs font-medium ${kelas.nilai ?? ""}`}>{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap gap-4">
          <motion.a
            href="#karya"
            className={kelas.tombol ?? "inline-flex items-center gap-2 rounded-full border border-current px-5 py-2.5 text-sm font-semibold transition-all hover:bg-foreground hover:text-background"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Lihat Karya
            <span>↓</span>
          </motion.a>

          <motion.a
            href="#contact"
            className={kelas.tombol ?? "inline-flex items-center gap-2 rounded-full border border-transparent bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-all hover:opacity-90"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Hubungi Saya
            <span>→</span>
          </motion.a>
        </div>
      </div>
    </div>
  );
}

/** Tiga kanal kontak. `title` selalu dipasang: ikon tanpa teks wajib punya
 *  penjelas saat disorot (Aturan Emas UI no. 4). */
export function KontakBlok({
  kontak,
  kelas = {},
  judul = "Kontak",
}: {
  kontak: KontakItem[];
  kelas?: { wadah?: string; item?: string; ikon?: string; label?: string; nilai?: string };
  judul?: string;
}) {
  return (
    <section id="contact" className="scroll-mt-28 pt-20">
      <span className="eyebrow">{judul}</span>
      <div className={kelas.wadah ?? "mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"}>
        {kontak.map((k, i) => (
          <motion.a
            key={k.label}
            href={k.href}
            target="_blank"
            rel="noopener noreferrer"
            title={k.petunjuk}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.05 }}
            className={kelas.item ?? "group flex items-center gap-4 p-5"}
          >
            <span className={kelas.ikon ?? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-current/20"}>
              <IkonKontak nama={k.ikon} />
            </span>
            <span className="min-w-0">
              <span className={`eyebrow block ${kelas.label ?? ""}`}>{k.label}</span>
              <span className={`block truncate text-sm font-semibold ${kelas.nilai ?? ""}`}>
                {k.tampil}
              </span>
            </span>
            <span aria-hidden className="ml-auto shrink-0 transition-transform group-hover:translate-x-1">
              →
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
