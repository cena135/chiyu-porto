"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Tombol yang tertarik ke arah kursor saat disorot, lalu memantul kembali ke
 * tengah saat kursor pergi.
 *
 * Listener dipasang lewat prop React (onMouseMove/onMouseLeave), bukan
 * addEventListener manual — React yang melepasnya sendiri saat komponen
 * dilepas, jadi tidak ada listener yang menumpuk.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  className,
  /** Sejauh apa tombol boleh tertarik, dalam piksel. */
  jangkauan = 16,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  jangkauan?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // damping rendah + stiffness sedang = ada pantulan kecil saat kembali ke
  // tengah. Itu bagian yang membuatnya terasa "hidup", bukan sekadar bergeser.
  const sx = useSpring(x, { stiffness: 260, damping: 14, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 14, mass: 0.5 });

  // Pegas terpisah dan lebih lambat untuk teksnya. Diangkat ke sini, bukan
  // dipanggil di dalam JSX: hook tidak boleh berada di tempat yang urutan
  // pemanggilannya bisa berubah.
  const tx = useSpring(x, { stiffness: 200, damping: 16 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Jarak kursor dari titik tengah tombol, dinormalkan ke -1..1
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    x.set(Math.max(-1, Math.min(1, dx)) * jangkauan);
    y.set(Math.max(-1, Math.min(1, dy)) * jangkauan);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  const isi = (
    <motion.span
      // Teks ikut tertarik, tapi hanya separuh jarak tombolnya. Beda kecepatan
      // inilah yang memberi kesan kedalaman, bukan blok yang bergeser rata.
      style={{ x: tx }}
      className="pointer-events-none inline-block"
    >
      {children}
    </motion.span>
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="inline-block"
    >
      {href ? (
        <a href={href} className={className}>
          {isi}
        </a>
      ) : (
        <button type="button" onClick={onClick} className={className}>
          {isi}
        </button>
      )}
    </motion.div>
  );
}
