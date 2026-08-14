"use client";

import { Bento } from "@/components/Bento";
import { ContactBento } from "@/components/ContactBento";
import type { ThemeProps } from "./types";

/**
 * Tema bawaan — wajah situs yang sesungguhnya.
 *
 * Dibungkus supaya bentuknya sama dengan delapan tema lain (satu komponen,
 * satu prop `projects`), sehingga pengalih tema tidak perlu tahu bahwa yang
 * satu ini istimewa.
 */
export function BentoTheme({ projects }: ThemeProps) {
  return (
    <div className="mx-auto w-full max-w-[86rem] px-6 pb-24 sm:px-10">
      <Bento projects={projects} />
      <ContactBento />
    </div>
  );
}
