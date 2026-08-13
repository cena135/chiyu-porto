"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

/**
 * Balon penjelas untuk kontrol yang hanya berupa ikon (Aturan Emas UI no. 4).
 *
 * Membungkus, bukan menggantikan, atribut bawaan: pemakainya TETAP harus
 * memasang `title` dan `aria-label` pada tombolnya sendiri. Balon ini hanya
 * lapisan visual — pembaca layar membaca `aria-label`, dan kalau JavaScript
 * mati, `title` bawaan browser masih muncul. Tooltip yang hanya digambar
 * dengan div akan hilang sepenuhnya di kedua keadaan itu.
 */
export function Tooltip({
  label,
  children,
  posisi = "atas",
}: {
  label: string;
  children: React.ReactNode;
  posisi?: "atas" | "bawah";
}) {
  const [tampil, setTampil] = useState(false);

  return (
    /* WAJIB motion.span, bukan span biasa: Framer Motion mengalirkan varian
       ("hover", "show", …) dari induk ke anak hanya lewat rantai motion
       component. Satu elemen polos di tengah memutus rantainya, dan animasi
       ikon di dalamnya diam-diam berhenti bekerja. */
    <motion.span
      className="relative inline-flex"
      onMouseEnter={() => setTampil(true)}
      onMouseLeave={() => setTampil(false)}
      // Ikut muncul saat kontrolnya dijangkau lewat keyboard, bukan cuma mouse.
      onFocus={() => setTampil(true)}
      onBlur={() => setTampil(false)}
    >
      {children}

      <AnimatePresence>
        {tampil && (
          <motion.span
            role="presentation"
            initial={{ opacity: 0, y: posisi === "atas" ? 4 : -4, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: posisi === "atas" ? 4 : -4, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className={[
              "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap",
              "rounded-lg bg-text px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg",
              posisi === "atas" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]",
            ].join(" ")}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}
