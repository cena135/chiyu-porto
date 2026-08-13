import type { Metadata } from "next";
import { getDemoProjects } from "../_data";
import { ProjectCardV1 } from "@/components/demo/ProjectCardV1";
import { CursorMode } from "@/components/ui/cursor-store";
import { HeroV1 } from "@/components/demo/HeroV1";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Demo V1 · Clean Modern",
  robots: { index: false },
};

export default async function Page() {
  const projects = await getDemoProjects();

  return (
    /* Seluruh gaya tema ini di-scope ke `.theme-v1` — tidak ada satu pun
       aturannya yang bocor ke halaman utama. */
    <main className="theme-v1 mx-auto w-full max-w-[86rem] px-6 pb-32 sm:px-10">
      <CursorMode mode="standard" />
      <HeroV1 />

      <section id="karya-demo" className="pt-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Indeks · 01</span>
            <h2 className="display mt-3 text-[clamp(1.75rem,4vw,3rem)]">
              Karya Terpilih
            </h2>
          </div>
          <span className="eyebrow">Monokrom presisi</span>
        </div>
        <hr className="hairline mb-10" />

        {projects.length === 0 ? (
          <p className="glass radius-modern px-8 py-16 text-center text-sm text-text-dim">
            Belum ada proyek di database.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {projects.map((p, i) => (
              <ProjectCardV1 key={p.id} project={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
