import type { Metadata } from "next";
import { getDemoProjects } from "../_data";
import { NeoGrid } from "./NeoGrid";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Demo · Neo Brutalism",
  robots: { index: false },
};

export default async function Page() {
  const projects = await getDemoProjects();

  return (
    /* Seluruh gaya tema ini dikurung `.theme-neo` di globals.css — tidak ada
       satu pun aturannya yang bisa bocor ke beranda. */
    <main className="theme-neo mx-auto w-full max-w-[86rem] px-6 pb-32 pt-24 sm:px-10">
      <header className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] sm:p-12">
        <span className="eyebrow">Eksperimen 01</span>
        <h1 className="display mt-4 text-[clamp(2.5rem,8vw,6rem)]">
          Neo
          <br />
          Brutalism
        </h1>
        <p className="mt-6 max-w-xl text-sm font-medium leading-relaxed text-neutral-800">
          Garis tebal, bayangan padat tanpa blur, dan warna primer yang tidak minta izin.
          Arahkan kursor ke kartu — semuanya memantul kaku, bukan meluncur.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#karya"
            className="neo-tag inline-block bg-[#FFDD57] px-6 py-3 text-sm font-black uppercase"
          >
            Lihat Karya
          </a>
          <a
            href="#karya"
            className="neo-tag inline-block bg-[#FF5A5F] px-6 py-3 text-sm font-black uppercase text-white"
          >
            Kontak
          </a>
        </div>
      </header>

      <section id="karya" className="scroll-mt-28 pt-16">
        <h2 className="display mb-8 text-3xl">Karya</h2>
        <NeoGrid projects={projects} />
      </section>
    </main>
  );
}
