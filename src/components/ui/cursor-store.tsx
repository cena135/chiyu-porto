"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type CursorVariant = "default" | "explore" | "link";

type Ctx = {
  variant: CursorVariant;
  setVariant: (v: CursorVariant) => void;
};

const CursorCtx = createContext<Ctx>({
  variant: "default",
  setVariant: () => {},
});

/**
 * Hanya VARIAN kursor yang disimpan di React state.
 *
 * Posisi kursor SENGAJA tidak ikut ke sini: mousemove menembak puluhan kali per
 * detik, dan menaruhnya di state akan memicu render ulang seluruh pohon
 * komponen setiap kali mouse bergerak. Posisi ditangani motion value di
 * CustomCursor, yang menulis langsung ke transform tanpa render React.
 */
export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariantState] = useState<CursorVariant>("default");

  // useCallback + useMemo supaya konsumen tidak ikut render ulang tiap kali
  // provider ini di-render oleh induknya.
  const setVariant = useCallback((v: CursorVariant) => setVariantState(v), []);
  const nilai = useMemo(() => ({ variant, setVariant }), [variant, setVariant]);

  return <CursorCtx.Provider value={nilai}>{children}</CursorCtx.Provider>;
}

export function useCursor() {
  return useContext(CursorCtx);
}

/** Pintasan untuk dipasang di onMouseEnter/onMouseLeave sebuah elemen. */
export function useCursorHandlers(v: CursorVariant) {
  const { setVariant } = useCursor();
  return useMemo(
    () => ({
      onMouseEnter: () => setVariant(v),
      onMouseLeave: () => setVariant("default"),
    }),
    [setVariant, v],
  );
}
