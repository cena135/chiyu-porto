"use client";

import { motion } from "framer-motion";

/**
 * Teks yang bergulir seperti silinder saat disorot: teks utama terlempar ke
 * atas, salinannya masuk dari bawah.
 *
 * Kuncinya `overflow-hidden` pada pembungkus — tanpa itu kedua teks terlihat
 * bersamaan dan efeknya berubah jadi sekadar dua baris yang bergeser.
 */
export function RevealText({
  children,
  /** Teks pengganti saat disorot. Kalau kosong, memakai teks yang sama. */
  swap,
  className,
}: {
  children: string;
  swap?: string;
  className?: string;
}) {
  const kedua = swap ?? children;

  const naik = {
    rest: { y: "0%" },
    hover: { y: "-100%" },
  };
  const masuk = {
    rest: { y: "100%" },
    hover: { y: "0%" },
  };
  const transisi = { type: "spring" as const, stiffness: 280, damping: 26 };

  return (
    <span
      className={`relative inline-block overflow-hidden align-bottom ${className ?? ""}`}
      // initial/whileHover ditaruh di induk supaya KEDUA lapisan bergerak
      // serempak dari satu pemicu; kalau masing-masing punya pemicu sendiri,
      // keduanya bisa tidak sinkron saat kursor bergerak cepat.
    >
      <motion.span
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="block"
      >
        <motion.span variants={naik} transition={transisi} className="block">
          {children}
        </motion.span>
        <motion.span
          variants={masuk}
          transition={transisi}
          aria-hidden
          className="absolute inset-0 block"
        >
          {kedua}
        </motion.span>
      </motion.span>
    </span>
  );
}
