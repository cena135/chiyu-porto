"use client";

import { useEffect, useState } from "react";

/**
 * Mengetik teks huruf demi huruf, lengkap dengan kursor blok ala terminal.
 *
 * Memakai satu timeout berantai, bukan setInterval: kalau komponen dilepas di
 * tengah pengetikan, hanya ada satu timer yang perlu dibatalkan.
 */
export function Typewriter({
  text,
  className,
  /** Milidetik per huruf. */
  speed = 22,
  delay = 0,
}: {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}) {
  const [n, setN] = useState(0);
  const [mulai, setMulai] = useState(delay === 0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setN(text.length);
      return;
    }
    if (mulai) return;
    const t = setTimeout(() => setMulai(true), delay);
    return () => clearTimeout(t);
  }, [delay, mulai, text.length]);

  useEffect(() => {
    if (!mulai || n >= text.length) return;
    const t = setTimeout(() => setN((v) => v + 1), speed);
    return () => clearTimeout(t);
  }, [mulai, n, speed, text.length]);

  const selesai = n >= text.length;

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className={selesai ? "" : "caret"}>
        {text.slice(0, n)}
      </span>
    </span>
  );
}
