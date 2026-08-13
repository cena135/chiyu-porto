"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CursorVariant = "default" | "explore";

/**
 * Gaya kursor per tema.
 * - standard : titik murni, tidak pernah berubah wujud (V1 · Apple Pro)
 * - smart    : titik yang membesar jadi lingkaran EXPLORE (V2 · Liquid Glass)
 * - terminal : balok berkedip ala konsol (V3 · Pro Hacker)
 */
export type CursorMode = "standard" | "smart" | "terminal";

type Ctx = {
  variant: CursorVariant;
  setVariant: (v: CursorVariant) => void;
  mode: CursorMode;
  setMode: (m: CursorMode) => void;
};

const CursorCtx = createContext<Ctx>({
  variant: "default",
  setVariant: () => {},
  mode: "smart",
  setMode: () => {},
});

/**
 * Hanya VARIAN dan MODE yang disimpan di React state.
 *
 * Posisi kursor SENGAJA tidak ikut: mousemove menembak puluhan kali per detik,
 * dan menaruhnya di state akan memicu render ulang seluruh pohon komponen tiap
 * kali mouse bergerak. Posisi ditangani motion value di CustomCursor, yang
 * menulis langsung ke transform tanpa render React sama sekali.
 */
export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariantState] = useState<CursorVariant>("default");
  const [mode, setModeState] = useState<CursorMode>("smart");

  const setVariant = useCallback((v: CursorVariant) => setVariantState(v), []);
  const setMode = useCallback((m: CursorMode) => setModeState(m), []);

  const nilai = useMemo(
    () => ({ variant, setVariant, mode, setMode }),
    [variant, setVariant, mode, setMode],
  );

  return <CursorCtx.Provider value={nilai}>{children}</CursorCtx.Provider>;
}

export function useCursor() {
  return useContext(CursorCtx);
}

/**
 * Dipasang di halaman demo untuk mengunci gaya kursornya.
 * Dikembalikan ke "smart" saat halaman ditinggalkan, supaya mode satu tema
 * tidak ikut terbawa ke halaman berikutnya.
 */
export function CursorMode({ mode }: { mode: CursorMode }) {
  const { setMode } = useCursor();

  useEffect(() => {
    setMode(mode);
    return () => setMode("smart");
  }, [mode, setMode]);

  return null;
}
