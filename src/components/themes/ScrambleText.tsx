"use client";

import { useEffect, useRef, useState } from "react";

const GLYPH = "!<>-_\\/[]{}—=+*^?#01ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Teks acak yang perlahan "terpecahkan" jadi kalimat aslinya.
 *
 * Berjalan dengan requestAnimationFrame, bukan setInterval: rAF berhenti
 * sendiri saat tab tidak aktif, sedangkan setInterval terus membakar CPU di
 * latar belakang — dan di halaman dengan banyak kartu, itu berlipat.
 */
export function ScrambleText({
  text,
  className,
  /** Berapa frame yang dibutuhkan tiap huruf untuk mengunci. */
  speed = 2,
  /** Naikkan nilainya untuk memutar ulang efek — dipakai saat hover. */
  replayKey = 0,
}: {
  text: string;
  className?: string;
  speed?: number;
  replayKey?: number;
}) {
  const [tampil, setTampil] = useState(text);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Hormati setelan aksesibilitas: langsung tampilkan hasil akhirnya.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setTampil(text);
      return;
    }

    let frame = 0;
    // Tiap huruf punya waktu mulai dan durasi sendiri supaya terpecahkannya
    // tidak serempak — itu yang membuatnya terbaca sebagai "decrypt".
    const jadwal = Array.from(text, (_, i) => ({
      awal: Math.floor(Math.random() * 16) + i * speed,
      lama: Math.floor(Math.random() * 12) + 8,
    }));

    const jalan = () => {
      let selesai = 0;
      let keluar = "";

      for (let i = 0; i < text.length; i++) {
        const { awal, lama } = jadwal[i];
        if (text[i] === " ") {
          keluar += " ";
          selesai++;
        } else if (frame >= awal + lama) {
          keluar += text[i];
          selesai++;
        } else if (frame >= awal) {
          keluar += GLYPH[Math.floor(Math.random() * GLYPH.length)];
        } else {
          keluar += " ";
        }
      }

      setTampil(keluar);
      frame++;
      if (selesai < text.length) rafRef.current = requestAnimationFrame(jalan);
    };

    rafRef.current = requestAnimationFrame(jalan);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [text, speed, replayKey]);

  return (
    <span className={className}>
      {/* Teks asli tetap ada untuk pembaca layar dan mesin pencari — yang
          teracak hanya yang terlihat. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden>{tampil}</span>
    </span>
  );
}
