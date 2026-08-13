import type { Metadata } from "next";
import { getDemoProjects } from "../_data";
import { ProjectCardV2 } from "@/components/demo/ProjectCardV2";
import { CursorMode } from "@/components/ui/cursor-store";
import { HeroV2 } from "@/components/demo/HeroV2";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Demo V2 · Liquid Glass",
  robots: { index: false },
};

export default async function Page() {
  const projects = await getDemoProjects();

  return (
    /* Seluruh gaya tema ini di-scope ke `.theme-v2` — tidak ada satu pun
       aturannya yang bocor ke halaman utama. */
    <main className="theme-v2 mx-auto w-full max-w-[86rem] px-6 pb-32 sm:px-10">
      <CursorMode mode="smart" />
      <HeroV2 />

      <section id="karya-demo" className="pt-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Indeks · 01</span>
            <h2 className="display mt-3 text-[clamp(1.75rem,4vw,3rem)]">
              Karya Terpilih
            </h2>
          </div>
          <span className="eyebrow">Kaca tebal + aurora</span>
        </div>
        <hr className="hairline mb-10" />

        {projects.length === 0 ? (
          <p className="glass radius-modern px-8 py-16 text-center text-sm text-text-dim">
            Belum ada proyek di database.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {projects.map((p, i) => (
              <ProjectCardV2 key={p.id} project={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
