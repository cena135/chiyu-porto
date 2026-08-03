"use client";

import { useEffect, useRef } from "react";

/**
 * Tautan anchor dengan animasi gulir yang digambar sendiri per frame.
 *
 * KENAPA TIDAK MEMAKAI behavior:"smooth" BAWAAN:
 * Kalau OS menyalakan "reduce motion" (di Windows: Settings > Accessibility >
 * Visual effects > Animation effects OFF — sering dipakai demi baterai),
 * Chromium MEMATIKAN seluruh smooth scroll bawaan. Baik CSS `scroll-behavior`
 * maupun `scrollTo({behavior:"smooth"})` akan langsung melompat, tanpa error
 * apa pun. Karena itu animasinya digerakkan manual lewat requestAnimationFrame:
 * ini murni memindahkan posisi gulir tiap frame, jadi tidak ada yang bisa
 * dimatikan browser.
 */

/** easeInOutCubic — pelan di awal, cepat di tengah, mendarat halus. */
function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function SmoothScrollLink({
  targetId,
  children,
  className,
  offset = 80,
}: {
  targetId: string;
  children: React.ReactNode;
  className?: string;
  offset?: number;
}) {
  const frame = useRef<number | null>(null);

  // Hentikan animasi kalau komponen dilepas di tengah jalan.
  useEffect(() => {
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  function animateTo(to: number) {
    if (frame.current !== null) cancelAnimationFrame(frame.current);

    const from = window.scrollY;
    const jarak = to - from;
    if (Math.abs(jarak) < 2) return;

    // Durasi ikut jarak: lompatan pendek tidak terasa lamban, lompatan jauh
    // tidak terasa terburu-buru. Dibatasi 450–900ms.
    const durasi = Math.min(900, Math.max(450, Math.abs(jarak) * 0.6));
    const mulai = performance.now();

    // Kalau pengguna menggulir sendiri di tengah animasi, mengalah — memaksa
    // terus akan terasa seperti halaman melawan tangan.
    let batal = false;
    const stop = () => {
      batal = true;
    };
    const opsi = { passive: true, once: true } as const;
    window.addEventListener("wheel", stop, opsi);
    window.addEventListener("touchstart", stop, opsi);
    window.addEventListener("keydown", stop, opsi);

    const bersihkan = () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      frame.current = null;
    };

    const langkah = (sekarang: number) => {
      if (batal) return bersihkan();

      const t = Math.min(1, (sekarang - mulai) / durasi);
      window.scrollTo(0, from + jarak * ease(t));

      if (t < 1) frame.current = requestAnimationFrame(langkah);
      else bersihkan();
    };

    frame.current = requestAnimationFrame(langkah);
  }

  function handleScroll(e: React.MouseEvent<HTMLAnchorElement>) {
    // Klik-tengah / Ctrl+klik / Shift+klik tetap milik browser (buka tab baru).
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    const target = document.getElementById(targetId);
    if (!target) return; // target hilang -> biarkan anchor bawaan bekerja

    e.preventDefault();

    const maks = document.documentElement.scrollHeight - window.innerHeight;
    const tujuan = target.getBoundingClientRect().top + window.scrollY - offset;

    animateTo(Math.max(0, Math.min(tujuan, maks)));
    history.replaceState(null, "", `#${targetId}`);
  }

  return (
    <a href={`#${targetId}`} onClick={handleScroll} className={className}>
      {children}
    </a>
  );
}
