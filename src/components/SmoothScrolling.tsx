"use client";

import { useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";

/**
 * Gulir meluncur seluruh halaman (Lenis).
 *
 * Kenapa komponen klien terpisah, bukan langsung di `layout.tsx`:
 * layout adalah Server Component, dan Lenis butuh `window`. Membungkusnya di
 * sini menjaga layout tetap dirender di server — hanya pembungkus tipis ini
 * yang dikirim ke browser, sementara seluruh `children` di dalamnya TETAP
 * boleh berupa Server Component (React melewatkannya sebagai prop, bukan
 * mengubahnya jadi kode klien).
 *
 * `root` membuat Lenis mengambil alih penggulir dokumen, bukan membuat kotak
 * gulir sendiri — penting supaya `position: fixed`, anchor, dan bilah gulir
 * bawaan tetap berperilaku normal.
 */
export function SmoothScrolling({ children }: { children: React.ReactNode }) {
  // Dibaca lewat efek, bukan saat render: `matchMedia` tidak ada di server,
  // dan menebaknya saat render akan membuat markup server dan klien berbeda.
  const [hematGerak, setHematGerak] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const baca = () => setHematGerak(mq.matches);
    baca();
    mq.addEventListener("change", baca);
    return () => mq.removeEventListener("change", baca);
  }, []);

  // Pengguna yang minta "kurangi animasi" tidak boleh dipaksa meluncur:
  // gulir yang punya inersia adalah pemicu motion sickness yang klasik.
  // Tanpa Lenis, gulir kembali ke perilaku asli browser — bukan mati.
  if (hematGerak) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        // 1.05 detik: cukup untuk terasa meluncur, masih jauh dari kesan berat.
        duration: 1.05,
        // Kurva yang melambat tajam di akhir — inilah yang memberi kesan "air"
        // dan bukan sekadar gulir yang diperlambat.
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // Lenis menangani sendiri klik <a href="#...">, jadi tombol "Lihat
        // Karya" ikut meluncur. Tanpa ini, anchor melompat instan karena
        // `scroll-behavior: smooth` milik CSS sudah kita matikan.
        // Sentuhan di ponsel dibiarkan memakai gulir asli sistem: inersia
        // buatan di atas inersia bawaan layar sentuh terasa melayang.
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
