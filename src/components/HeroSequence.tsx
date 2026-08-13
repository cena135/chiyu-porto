"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sequence gambar yang terikat scroll — teknik yang dipakai halaman produk Apple.
 *
 * Cara kerjanya: SEMUA frame di-preload lebih dulu, lalu posisi scroll dipetakan
 * ke indeks frame. Yang digambar cuma satu <canvas>, bukan 36 <img> — jadi tidak
 * ada gambar yang baru diunduh saat sedang digulir, dan itu sumber utama stutter
 * pada implementasi naif.
 *
 * GSAP + ScrollTrigger di-import DINAMIS di dalam efek. Kalau di-import statis,
 * ~70 KB ikut terunduh oleh semua pengunjung — termasuk yang cuma membuka
 * halaman detail proyek yang tidak memakai komponen ini sama sekali.
 */
export function HeroSequence({
  frames = 36,
  dir = "/hero-frames",
  ext = "svg",
  /** Panjang scroll saat canvas dipaku, relatif tinggi layar. */
  scrollLength = "+=220%",
}: {
  frames?: number;
  dir?: string;
  ext?: string;
  scrollLength?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(-1);

  const [siap, setSiap] = useState(false);
  const [progresMuat, setProgresMuat] = useState(0);

  const src = (i: number) => `${dir}/frame-${String(i + 1).padStart(3, "0")}.${ext}`;

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
        setProgresMuat(Math.round((selesai / frames) * 100));
        // Frame pertama sudah cukup untuk menggambar sesuatu lebih awal.
        if (i === 0) gambar(0);
        if (selesai === frames) setSiap(true);
      };

      img.onload = tandai;
      // Frame rusak tidak boleh menggantung seluruh preload.
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
  }, [frames, dir, ext]);

  /* ---------- 2. Menggambar satu frame (cover-fit, tajam di layar HiDPI) ---------- */
  function ukurCanvas() {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    // DPR dibatasi 2: di layar 3x, buffer-nya jadi 9x luas dan T480 kewalahan
    // tanpa perbedaan yang benar-benar terlihat.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = wrap.getBoundingClientRect();

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  function gambar(index: number) {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    // cover-fit: isi penuh tanpa gepeng, selalu terpusat — termasuk di ponsel
    // yang rasionya jauh lebih tinggi daripada frame persegi.
    const skala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * skala;
    const h = img.naturalHeight * skala;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);

    frameRef.current = index;
  }

  /* ---------- 3. Hubungkan ke scroll ---------- */
  useEffect(() => {
    let mati = false;
    let bersihkan: (() => void) | undefined;

    const kurangiGerak =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const onResize = () => {
      ukurCanvas();
      gambar(frameRef.current < 0 ? 0 : frameRef.current);
    };

    (async () => {
      ukurCanvas();
      window.addEventListener("resize", onResize);

      if (kurangiGerak) {
        // Hormati setelan aksesibilitas: tampilkan satu frame diam, tanpa
        // memaku layar dan tanpa animasi apa pun.
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

      const proxy = { f: 0 };
      const st = ScrollTrigger.create({
        trigger: wrapRef.current,
        start: "top top",
        end: scrollLength,
        pin: true,
        // scrub angka (bukan `true`) memberi peredam inersia — inilah yang
        // membuat gerakannya terasa mulus, bukan menempel kaku ke roda scroll.
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          proxy.f = self.progress * (frames - 1);
          const idx = Math.min(frames - 1, Math.max(0, Math.round(proxy.f)));
          // Gambar ulang HANYA kalau indeksnya benar-benar berganti. Tanpa
          // penjaga ini, satu frame bisa digambar puluhan kali per detik.
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
  }, [frames, scrollLength]);

  return (
    <section
      ref={wrapRef}
      aria-label="Animasi bola kawat yang berputar mengikuti guliran"
      className="relative h-screen w-full overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Keterangan editorial, mengikuti gaya situs */}
      <div className="pointer-events-none absolute inset-x-0 top-10 flex justify-center px-6">
        <span className="eyebrow eyebrow-bright">Gulir untuk memutar</span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-10 flex flex-col items-center gap-2 px-6 text-center">
        <p className="display max-w-2xl text-[clamp(1.1rem,2.4vw,1.9rem)] text-mist-300">
          Dibangun sendiri, dijalankan sendiri.
        </p>
        <span className="eyebrow text-mist-400/70">
          {siap ? "Self-hosted · ThinkPad T480 · Cloudflare Tunnel" : `Memuat ${progresMuat}%`}
        </span>
      </div>
    </section>
  );
}
