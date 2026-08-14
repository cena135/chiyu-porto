import type { Metadata } from "next";
import { getDemoProjects } from "../_data";
import { NeoTheme } from "@/components/themes/NeoTheme";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Demo · Neo Brutalism",
  robots: { index: false },
};

/** Rute demo ini sekarang hanya pembungkus tipis. Komponen temanya dipakai
 *  bersama beranda lewat pengalih sembilan tema — satu sumber, satu tempat
 *  memperbaiki kalau ada yang meleset. */
export default async function Page() {
  const projects = await getDemoProjects();
  return (
    <main>
      <NeoTheme projects={projects} />
    </main>
  );
}
