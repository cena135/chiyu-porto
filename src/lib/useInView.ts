"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Deteksi elemen masuk viewport, sekali saja (tidak dianimasikan ulang saat scroll balik).
 * Fallback: kalau IntersectionObserver tidak ada, elemen langsung dianggap terlihat
 * supaya konten tidak pernah tersangkut tak kelihatan.
 */
export function useInView<T extends HTMLElement>(
  rootMargin = "0px 0px -12% 0px",
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      // rootMargin negatif di bawah: animasi mulai sedikit setelah kartu benar-benar masuk,
      // bukan saat ujungnya baru menyentuh layar.
      { threshold: 0.12, rootMargin },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
