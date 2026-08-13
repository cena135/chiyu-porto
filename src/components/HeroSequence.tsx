"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sequence gambar yang di-scrub oleh guliran SELURUH halaman, dipasang sebagai
 * latar tetap (fixed) di belakang konten.
 *
 * Cara kerjanya: semua frame di-preload lebih dulu, lalu posisi scroll dokumen
 * dipetakan ke indeks frame dan digambar ke satu <canvas>. Karena hanya satu
 * elemen yang digambar dari memori, tidak ada gambar yang baru diunduh saat
 * sedang digulir — itu sumber utama stutter pada implementasi naif.
 *
 * GSAP di-import DINAMIS. Kalau statis, ~70 KB ikut terunduh oleh semua
 * pengunjung termasuk yang cuma membuka halaman detail proyek.
 */
export function HeroSequence({
  frames = 151,
  dir = "/sequence",
  /** Nama berkas: {dir}/{prefix}{nomor 3 digit}.{ext} */
  prefix = "ezgif-frame-",
  ext = "jpg",
  /**
   * Perbesaran untuk memotong watermark di pinggir frame.
   * 1.08 memangkas ~4% dari tiap sisi. Naikkan kalau watermark masih terlihat.
   */
  zoom = 1.08,
  /** Peredam inersia ScrollTrigger. Angka kecil = lebih responsif. */
  scrub = 0.5,
}: {
  frames?: number;
  dir?: string;
  prefix?: string;
  ext?: string;
  zoom?: number;
  scrub?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(-1);
  const siapRef = useRef(false);

  const [progres, setProgres] = useState(0);
  const [siap, setSiap] = useState(false);

  const src = (i: number) => `${dir}/${prefix}${String(i + 1).padStart(3, "0")}.${ext}`;

  /* ---------- Menggambar satu frame: cover-fit, terpusat, tajam ---------- */
  function ukurCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // DPR dibatasi 2: di layar 3x, buffer-nya jadi 9x luas dan T480 kewalahan
    // tanpa perbedaan yang benar-benar terlihat.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
  }

  function gambar(index: number) {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    /**
     * cover-fit dihitung manual di sini.
     *
     * `object-fit: cover` di CSS TIDAK berpengaruh pada isi <canvas> — properti
     * itu hanya berlaku untuk elemen tergantikan seperti <img>/<video>. Kalau
     * hanya mengandalkan CSS, gambarnya akan gepeng mengikuti rasio layar.
     */
    const skala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * skala;
    const h = img.naturalHeight * skala;

    ctx.fillStyle = "#0b0d15"; // ink-950, mencegah kedip putih di sela frame
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);

    frameRef.current = index;
  }

  /* ---------- 1. Preload semua frame ---------- */
  useEffect(() => {
    let batal = false;
    let selesai = 0;

    const daftar: HTMLImageElement[] = Array.from({ length: frames }, (_, i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src(i);

      const tandai = () => {
        if (batal) return;
        selesai++;
        setProgres(Math.round((selesai / frames) * 100));

        // Gambar frame pertama begitu tersedia supaya latar tidak kosong
        // selama sisa frame masih diunduh.
        if (i === 0) {
          ukurCanvas();
          gambar(0);
        }
        if (selesai === frames) {
          siapRef.current = true;
          setSiap(true);
        }
      };

      // Frame rusak tidak boleh menggantung seluruh preload.
      img.onload = tandai;
      img.onerror = tandai;
      return img;
    });

    imagesRef.current = daftar;

    return () => {
      batal = true;
      for (const img of daftar) {
        img.onload = null;
        img.onerror = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, dir, prefix, ext]);

  /* ---------- 2. Hubungkan ke guliran seluruh halaman ---------- */
  useEffect(() => {
    // Sesuai permintaan: GSAP baru dijalankan SETELAH semua frame siap.
    if (!siap) return;

    let mati = false;
    let bersihkan: (() => void) | undefined;

    const onResize = () => {
      ukurCanvas();
      gambar(frameRef.current < 0 ? 0 : frameRef.current);
    };

    const kurangiGerak = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      ukurCanvas();
      gambar(0);
      window.addEventListener("resize", onResize);

      if (kurangiGerak) {
        // Hormati setelan aksesibilitas: satu frame diam, tanpa animasi.
        gambar(Math.floor(frames / 2));
        bersihkan = () => window.removeEventListener("resize", onResize);
        return;
      }

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (mati) return;

      gsap.registerPlugin(ScrollTrigger);

      const st = ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(
            frames - 1,
            Math.max(0, Math.round(self.progress * (frames - 1))),
          );
          // Gambar ulang HANYA saat indeksnya benar-benar berganti — tanpa
          // penjaga ini satu frame bisa digambar puluhan kali per detik.
          if (idx !== frameRef.current) gambar(idx);
        },
      });

      ScrollTrigger.refresh();

      bersihkan = () => {
        st.kill();
        window.removeEventListener("resize", onResize);
      };
    })();

    return () => {
      mati = true;
      bersihkan?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siap, frames, scrub]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 h-screen w-screen"
        style={{
          zIndex: -5,
          // Memotong watermark di pinggir dengan memperbesar sedikit.
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
        }}
      />

      {/* Penanda muat — hilang sendiri setelah semua frame siap */}
      {!siap && (
        <span className="eyebrow pointer-events-none fixed bottom-5 right-5 z-10 text-mist-400/60">
          Memuat latar {progres}%
        </span>
      )}
    </>
  );
}
