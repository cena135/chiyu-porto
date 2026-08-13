"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCursor } from "./cursor-store";

/**
 * Kursor kustom yang WUJUDNYA berbeda tiap tema.
 *
 * Posisinya digerakkan motion value, BUKAN React state — mousemove menembak
 * puluhan kali per detik dan state akan memicu render sebanyak itu juga.
 */
export function CustomCursor() {
  const { variant, mode } = useCursor();
  const pathname = usePathname();
  const [aktif, setAktif] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Pegas ringan: titiknya sedikit tertinggal di belakang kursor asli, dan
  // jeda kecil itulah yang membuatnya terasa hidup, bukan menempel kaku.
  const sx = useSpring(x, { stiffness: 700, damping: 40, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 700, damping: 40, mass: 0.35 });

  useEffect(() => {
    // Dilewati di panel admin (kursor sistem lebih penting untuk mengetik),
    // pada perangkat sentuh, dan saat pengguna minta pengurangan gerak.
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

    // Wajib dilepas: tanpa ini tiap pemasangan ulang menumpuk listener baru
    // di window dan menjadi kebocoran memori.
    return () => window.removeEventListener("mousemove", gerak);
  }, [pathname, x, y]);

  if (!aktif) return null;

  /* ---------- V3 · balok terminal berkedip ---------- */
  if (mode === "terminal") {
    const diKartu = variant === "explore";
    return (
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center"
        style={{
          x: sx,
          y: sy,
          translateX: "-50%",
          translateY: "-50%",
          borderColor: "#22d3ee",
          borderStyle: "solid",
        }}
        animate={{
          width: diKartu ? 74 : 10,
          height: diKartu ? 26 : 20,
          borderRadius: 2,
          backgroundColor: diKartu ? "rgba(34,211,238,0.12)" : "#22d3ee",
          borderWidth: diKartu ? 1 : 0,
          opacity: diKartu ? 1 : [1, 1, 0, 0],
        }}
        transition={{
          width: { type: "spring", stiffness: 320, damping: 26 },
          height: { type: "spring", stiffness: 320, damping: 26 },
          // Kedip hanya saat diam. Di atas kartu kursornya solid supaya
          // labelnya terbaca — balok berkedip di balik teks justru mengganggu.
          opacity: diKartu
            ? { duration: 0.15 }
            : { duration: 1, repeat: Infinity, ease: "linear" },
        }}
      >
        <motion.span
          className="whitespace-nowrap text-[9px] font-semibold tracking-[0.14em] text-[#22d3ee]"
          animate={{ opacity: diKartu ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          [ OPEN ]
        </motion.span>
      </motion.div>
    );
  }

  /* ---------- V1 · titik murni, tidak pernah berubah wujud ---------- */
  if (mode === "standard") {
    return (
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full bg-white mix-blend-difference"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: 10, height: 10 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      />
    );
  }

  /* ---------- V2 & halaman utama · titik pintar ---------- */
  const besar = variant === "explore";
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full bg-white mix-blend-difference"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{ width: besar ? 84 : 12, height: besar ? 84 : 12 }}
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
