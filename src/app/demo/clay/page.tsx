import type { Metadata } from "next";
import { getDemoProjects } from "../_data";
import { ClayTheme } from "@/components/themes/ClayTheme";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Demo · Claymorphism",
  robots: { index: false },
};

/** Rute demo ini sekarang hanya pembungkus tipis. Komponen temanya dipakai
 *  bersama beranda lewat pengalih sembilan tema — satu sumber, satu tempat
 *  memperbaiki kalau ada yang meleset. */
export default async function Page() {
  const projects = await getDemoProjects();
  return (
    <main>
      <ClayTheme projects={projects} />
    </main>
  );
}
