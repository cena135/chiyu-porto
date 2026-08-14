"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TEMA, type ThemeId } from "./types";



const THEME_STYLES: Record<ThemeId, { panelBg: string, panelBorder: string, panelText: string, itemHover: string, itemActive: string, itemText: string, hintBg: string, hintText: string, btnBg: string, btnText: string, btnBorder: string }> = {
  vanta: {
    panelBg: "bg-[#05060f]/90 backdrop-blur-xl", panelBorder: "border-white/10", panelText: "text-white/80", itemHover: "hover:bg-white/10", itemActive: "bg-white text-black", itemText: "text-white/50", hintBg: "bg-white/10 border border-white/20 backdrop-blur-md", hintText: "text-white", btnBg: "bg-[#05060f]/80 backdrop-blur-md", btnText: "text-white", btnBorder: "border-white/20"
  },
  neo: {
    panelBg: "bg-[#ffdd57]", panelBorder: "border-4 border-black rounded-none shadow-[8px_8px_0_0_#000]", panelText: "text-black font-semibold", itemHover: "hover:bg-black/10", itemActive: "bg-black text-white rounded-none", itemText: "text-black/70", hintBg: "bg-black rounded-none", hintText: "text-white font-bold", btnBg: "bg-white", btnText: "text-black font-bold", btnBorder: "border-4 border-black rounded-none"
  },
  clay: {
    panelBg: "bg-[#e0e5ec]", panelBorder: "border-white shadow-[8px_8px_16px_#c3c8cf,-8px_-8px_16px_#fdffff] rounded-[2rem]", panelText: "text-[#3b2f63]", itemHover: "hover:shadow-[inset_4px_4px_8px_#c3c8cf,inset_-4px_-4px_8px_#fdffff]", itemActive: "shadow-[inset_4px_4px_8px_#c3c8cf,inset_-4px_-4px_8px_#fdffff] text-[#3b2f63] font-bold", itemText: "text-[#6b6191]", hintBg: "bg-[#3b2f63]", hintText: "text-[#e0e5ec]", btnBg: "bg-[#e0e5ec]", btnText: "text-[#3b2f63] font-semibold", btnBorder: "border-transparent shadow-[4px_4px_8px_#c3c8cf,-4px_-4px_8px_#fdffff]"
  },
  minimal: {
    panelBg: "bg-white/90 backdrop-blur-xl", panelBorder: "border-black/5", panelText: "text-black/80", itemHover: "hover:bg-black/5", itemActive: "bg-black text-white", itemText: "text-black/40", hintBg: "bg-black/5 backdrop-blur-md", hintText: "text-black", btnBg: "bg-white", btnText: "text-black", btnBorder: "border-black/10 shadow-sm"
  },
  glasslight: {
    panelBg: "bg-white/60 backdrop-blur-xl", panelBorder: "border-white/40 shadow-xl", panelText: "text-slate-800", itemHover: "hover:bg-white/60", itemActive: "bg-white text-blue-600 shadow-sm", itemText: "text-slate-500", hintBg: "bg-gradient-to-r from-blue-500 to-purple-500", hintText: "text-white", btnBg: "bg-white/50 backdrop-blur-md", btnText: "text-slate-800", btnBorder: "border-white/50 shadow-lg"
  },
  editorial: {
    panelBg: "bg-[#f4f4f0]", panelBorder: "border border-black rounded-none shadow-[8px_8px_0_0_#000]", panelText: "text-black font-serif", itemHover: "hover:bg-black/5 rounded-none", itemActive: "bg-black text-white rounded-none", itemText: "text-black/60 font-sans", hintBg: "bg-black rounded-none", hintText: "text-[#f4f4f0] font-serif", btnBg: "bg-[#f4f4f0]", btnText: "text-black font-serif", btnBorder: "border border-black rounded-none"
  },
  cyber: {
    panelBg: "bg-black/90 backdrop-blur-md", panelBorder: "border border-[#4ade80]/40 shadow-[0_0_15px_rgba(74,222,128,0.2)] rounded-none", panelText: "text-[#4ade80]", itemHover: "hover:bg-[#4ade80]/10 rounded-none", itemActive: "bg-[#4ade80] text-black rounded-none", itemText: "text-[#4ade80]/60", hintBg: "bg-[#4ade80] rounded-none", hintText: "text-black font-bold uppercase", btnBg: "bg-black", btnText: "text-[#4ade80]", btnBorder: "border border-[#4ade80] rounded-none shadow-[0_0_10px_rgba(74,222,128,0.2)]"
  },
  bento: {
    panelBg: "bg-white", panelBorder: "border-black/10 shadow-[0_24px_60px_-16px_rgb(0_0_0/0.45)] rounded-2xl", panelText: "text-slate-800", itemHover: "hover:bg-slate-100", itemActive: "bg-neutral-900 text-white", itemText: "text-slate-500", hintBg: "bg-black/80 backdrop-blur-md", hintText: "text-white", btnBg: "bg-white", btnText: "text-slate-800", btnBorder: "border-black/10 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.45)]"
  },
};

export function ThemeSwitcher({
  aktif,
  onPilih,
}: {
  aktif: ThemeId;
  onPilih: (id: ThemeId) => void;
}) {
  const [buka, setBuka] = useState(false);
  const wadah = useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar dan saat Escape
  useEffect(() => {
    if (!buka) return;

    const klikLuar = (e: MouseEvent) => {
      if (wadah.current && !wadah.current.contains(e.target as Node)) setBuka(false);
    };
    const tekanEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuka(false);
    };

    document.addEventListener("mousedown", klikLuar);
    document.addEventListener("keydown", tekanEsc);
    return () => {
      document.removeEventListener("mousedown", klikLuar);
      document.removeEventListener("keydown", tekanEsc);
    };
  }, [buka]);

  const sekarang = TEMA.find((t) => t.id === aktif) ?? TEMA[0];
  const style = THEME_STYLES[aktif] || THEME_STYLES.bento;

  return (
    <div ref={wadah} className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {buka && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className={`max-h-[70vh] w-64 overflow-y-auto overscroll-contain p-2 ${style.panelBg} ${style.panelBorder}`}
            data-lenis-prevent
          >
            <p className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] ${style.itemText}`}>
              Other themes
            </p>
            {TEMA.map((t) => {
              const dipilih = t.id === aktif;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onPilih(t.id);
                    setBuka(false);
                  }}
                  aria-current={dipilih}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    dipilih ? style.itemActive : `${style.panelText} ${style.itemHover}`,
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className={[
                      "h-2 w-2 shrink-0 rounded-full",
                      dipilih ? "bg-current" : style.itemText.replace("text-", "bg-").replace("/50", "/30").replace("/70", "/30").replace("/60", "/30").replace("/40", "/30"),
                    ].join(" ")}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{t.nama}</span>
                    <span
                      className={[
                        "block truncate text-[11px]",
                        dipilih ? "opacity-70" : style.itemText,
                      ].join(" ")}
                    >
                      {t.catatan}
                    </span>
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-end gap-3">
        {/* Hint text that disappears after opening the panel once */}
        {!buka && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs shadow-lg ${style.hintBg} ${style.hintText}`}
          >
            <span>Other theme?</span>
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ↓
            </motion.span>
          </motion.div>
        )}

        <motion.button
          type="button"
          onClick={() => setBuka((v) => !v)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          aria-expanded={buka}
          title="Ganti tema tampilan"
          className={`flex items-center gap-2.5 rounded-full py-2.5 pl-4 pr-3 text-sm transition-colors ${style.btnBg} ${style.btnText} ${style.btnBorder}`}
        >
          <span className="h-2 w-2 rounded-full bg-current opacity-70" aria-hidden />
          <span className="font-semibold">{sekarang.nama}</span>
          <motion.span
            aria-hidden
            animate={{ rotate: buka ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="text-xs opacity-50"
          >
            ▲
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}
