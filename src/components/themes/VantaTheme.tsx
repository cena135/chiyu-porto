"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { KontakBlok, ProfilBlok } from "./ThemeSections";
import type { ThemeProps } from "./types";

export function VantaTheme({ projects, profil, kontak }: ThemeProps) {
  const wadah = useRef<HTMLDivElement>(null);
  const [gagal, setGagal] = useState<string | null>(null);
  const [tigaSelesai, setTigaSelesai] = useState(false);
  const [vantaSelesai, setVantaSelesai] = useState(false);
  const efek = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setGagal("Dimatikan karena setelan “kurangi animasi” aktif.");
      return;
    }

    if (tigaSelesai && vantaSelesai && wadah.current) {
      const global = window as any;
      if (global.VANTA && global.VANTA.BIRDS) {
        try {
          efek.current = global.VANTA.BIRDS({
            el: wadah.current,
            mouseControls: true,
            touchControls: false,
            gyroControls: false,
            minHeight: 200,
            minWidth: 200,
            scale: 1,
            scaleMobile: 1,
            backgroundColor: 0x05060f,
            color1: 0x2563eb,
            color2: 0x7c3aed,
            birdSize: 1.2,
            wingSpan: 26,
            speedLimit: 4.5,
            separation: 40,
            quantity: 3,
          });
        } catch (e) {
          setGagal(e instanceof Error ? e.message : "WebGL gagal diinisialisasi");
        }
      } else {
        setGagal("Script Vanta/Three belum lengkap termuat");
      }
    }

    return () => {
      if (efek.current) {
        efek.current.destroy();
        efek.current = null;
      }
    };
  }, [tigaSelesai, vantaSelesai]);

  return (
    <div className="theme-vanta relative min-h-screen">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r119/three.min.js"
        strategy="lazyOnload"
        onLoad={() => setTigaSelesai(true)}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.birds.min.js"
        strategy="lazyOnload"
        onLoad={() => setVantaSelesai(true)}
      />

      <div
        ref={wadah}
        aria-hidden
        className="fixed inset-0 z-0"
        style={
          gagal
            ? { background: "radial-gradient(120% 100% at 20% 0%, #1b2570, #05060f 60%)" }
            : undefined
        }
      />

      <div className="relative z-10 mx-auto w-full max-w-[86rem] px-6 pb-32 pt-24 sm:px-10">
        <header className="vanta-card max-w-3xl rounded-[2rem] p-8 sm:p-12">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/50">
            {profil.status}
          </span>
          <h1 className="mt-5 text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[1.03] tracking-tight text-white">
            {profil.judul[0]} {profil.judul[1]}
            <br />
            {profil.judul[2]}
          </h1>

          <ProfilBlok
            profil={profil}
            kelas={{
              foto: "rounded-full ring-2 ring-white/25",
              bio: "text-sm leading-relaxed text-white/60",
              garis: "border-white/20",
              nilai: "text-white/85",
            }}
          />

          {gagal && (
            <p className="mt-6 text-xs text-white/40">Latar 3D tidak aktif — {gagal}</p>
          )}
        </header>

        <section className="pt-14">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 110, damping: 18, delay: i * 0.04 }}
                whileHover={{ y: -5 }}
                className="vanta-card group relative flex min-h-[13rem] flex-col justify-between overflow-hidden rounded-[1.5rem] p-6"
              >
                <Link href={`/p/${p.slug}`} className="absolute inset-0 z-10" aria-label={p.title} />
                <div className="relative">
                  <span className="text-[11px] tracking-[0.2em] text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">
                    {p.description}
                  </p>
                  {p.techStack.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.techStack.map((tech) => (
                        <span key={tech} className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/70">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span
                  aria-hidden
                  className="relative mt-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/70 transition-all group-hover:border-white/60 group-hover:bg-white/10 group-hover:text-white"
                >
                  →
                </span>
              </motion.article>
            ))}
          </div>
        </section>

        <KontakBlok
          kontak={kontak}
          kelas={{
            item: "vanta-card group flex items-center gap-4 overflow-hidden rounded-[1.5rem] p-5 text-white",
            ikon: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white/80",
            nilai: "text-white",
          }}
        />
      </div>
    </div>
  );
}
