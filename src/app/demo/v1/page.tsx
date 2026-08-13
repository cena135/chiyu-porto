import type { Metadata } from "next";
import { getDemoProjects } from "../_data";
import { BentoV1 } from "@/components/demo/BentoV1";
import { CursorMode } from "@/components/ui/cursor-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Demo V1 · Vibrant Bento Grid",
  robots: { index: false },
};

export default async function Page() {
  const projects = await getDemoProjects();

  return (
    /* Seluruh gaya tema ini di-scope ke `.theme-v1` — tidak ada satu pun
       aturannya yang bocor ke halaman utama. */
    <main className="theme-v1 mx-auto w-full max-w-[86rem] px-6 pb-32 sm:px-10">
      <CursorMode mode="standard" />

      {projects.length === 0 ? (
        <p className="bento mt-24 rounded-3xl px-8 py-16 text-center text-sm text-text-dim">
          Belum ada proyek di database.
        </p>
      ) : (
        <BentoV1 projects={projects} />
      )}
    </main>
  );
}
