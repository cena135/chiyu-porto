"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCursor } from "./cursor-store";

/**
 * Titik kursor yang mengikuti mouse di seluruh layar, membesar jadi lingkaran
 * bertuliskan EXPLORE saat berada di atas kartu proyek.
 *
 * Posisinya digerakkan motion value, BUKAN React state — mousemove menembak
 * puluhan kali per detik dan state akan memicu render sebanyak itu juga.
 */
export function CustomCursor() {
  const { variant } = useCursor();
  const pathname = usePathname();
  const [aktif, setAktif] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Pegas ringan: titiknya sedikit tertinggal di belakang kursor asli, dan
  // jeda kecil itulah yang membuatnya terasa hidup, bukan menempel kaku.
  const sx = useSpring(x, { stiffness: 700, damping: 40, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 700, damping: 40, mass: 0.35 });

  useEffect(() => {
    // Tidak dipasang di panel admin: di sana kursor sistem justru lebih penting
    // untuk mengetik dan memilih. Juga dilewati pada perangkat sentuh dan saat
    // pengguna minta pengurangan gerak.
    const layarSentuh = !window.matchMedia("(pointer: fine)").matches;
    const kurangiGerak = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (pathname?.startsWith("/admin") || layarSentuh || kurangiGerak) {
      setAktif(false);
      return;
    }

    setAktif(true);

    const gerak = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", gerak, { passive: true });

    // Wajib dilepas: tanpa ini, tiap kali komponen dipasang ulang akan
    // menumpuk listener baru di window dan menjadi kebocoran memori.
    return () => window.removeEventListener("mousemove", gerak);
  }, [pathname, x, y]);

  if (!aktif) return null;

  const besar = variant === "explore";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full mix-blend-difference"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: besar ? 84 : variant === "link" ? 28 : 12,
        height: besar ? 84 : variant === "link" ? 28 : 12,
        backgroundColor: besar ? "#ffffff" : "#ffffff",
      }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      <motion.span
        className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black"
        animate={{ opacity: besar ? 1 : 0, scale: besar ? 1 : 0.6 }}
        transition={{ duration: 0.18 }}
      >
        Explore
      </motion.span>
    </motion.div>
  );
}
