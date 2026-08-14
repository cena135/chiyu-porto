"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HeroKananBlok, KontakBlok, ProfilBlok } from "./ThemeSections";
import type { ThemeProps, ThemeProject } from "./types";

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
        strategy="afterInteractive"
        onLoad={() => setTigaSelesai(true)}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.birds.min.js"
        strategy="afterInteractive"
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

      <div className="relative z-10 mx-auto w-full max-w-[86rem] px-6 pt-24 sm:px-10">
        <header className="vanta-card rounded-[2rem] p-8 sm:p-12">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:justify-between">
            <div className="flex-1">
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
                  garis: "border-white/10",
                  nilai: "text-white/80",
                  tombol: "inline-flex items-center justify-center rounded-full bg-white/10 border border-white/25 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/20"
                }}
              />
            </div>

            <HeroKananBlok 
              projects={projects} 
              kelas={{
                wadah: "flex w-full shrink-0 flex-col justify-center gap-4 lg:w-[26rem]",
                marqueeWadah: "relative flex flex-col justify-center gap-4 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 py-6",
                marqueeItem: "rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/60",
                ctaWadah: "group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white transition-colors hover:bg-white/10",
                ctaJudul: "text-2xl font-semibold",
                ctaTombol: "mt-6 inline-flex w-max items-center justify-center rounded-full bg-white text-[#05060f] px-6 py-3.5 text-sm font-semibold transition-transform hover:scale-105",
              }} 
            />
          </div>
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
