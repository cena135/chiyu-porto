"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VantaTheme } from "./VantaTheme";
import { ThemeSwitcher } from "./ThemeSwitcher";
import type { ThemeId, ThemeProps } from "./types";

const memuat = (
  <div className="flex min-h-[60vh] items-center justify-center">
    <span className="text-xs uppercase tracking-[0.22em] text-neutral-400">Memuat tema…</span>
  </div>
);

const BentoTheme = dynamic(() => import("./BentoTheme").then((m) => m.BentoTheme), {
  ssr: false,
  loading: () => memuat,
});
const NeoTheme = dynamic(() => import("./NeoTheme").then((m) => m.NeoTheme), {
  ssr: false,
  loading: () => memuat,
});
const ClayTheme = dynamic(() => import("./ClayTheme").then((m) => m.ClayTheme), {
  ssr: false,
  loading: () => memuat,
});
const MinimalTheme = dynamic(() => import("./MinimalTheme").then((m) => m.MinimalTheme), {
  ssr: false,
  loading: () => memuat,
});
const LiquidLightTheme = dynamic(() => import("./LiquidLightTheme").then((m) => m.LiquidLightTheme), {
  ssr: false,
  loading: () => memuat,
});
const EditorialTheme = dynamic(() => import("./EditorialTheme").then((m) => m.EditorialTheme), {
  ssr: false,
  loading: () => memuat,
});
const CyberpunkTheme = dynamic(() => import("./CyberpunkTheme").then((m) => m.CyberpunkTheme), {
  ssr: false,
  loading: () => memuat,
});

const PABRIK: Record<ThemeId, React.ComponentType<ThemeProps>> = {
  vanta: VantaTheme,
  bento: BentoTheme,
  neo: NeoTheme,
  clay: ClayTheme,
  minimal: MinimalTheme,
  glasslight: LiquidLightTheme,
  editorial: EditorialTheme,
  cyber: CyberpunkTheme,
};

export function ThemeShowcase({ projects, profil, kontak }: ThemeProps) {
  const [tema, setTema] = useState<ThemeId>("vanta");
  const Aktif = PABRIK[tema];

  useEffect(() => {
    document.body.setAttribute("data-theme", tema);
    return () => document.body.removeAttribute("data-theme");
  }, [tema]);

  return (
    <>
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={tema}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <Aktif projects={projects} profil={profil} kontak={kontak} />
          </motion.div>
        </AnimatePresence>
      </div>

      <ThemeSwitcher aktif={tema} onPilih={setTema} />
    </>
  );
}
