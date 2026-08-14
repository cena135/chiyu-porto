import type { Metadata } from "next";
import { getDemoProjects } from "../_data";
import { ClayGrid } from "./ClayGrid";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Demo · Claymorphism",
  robots: { index: false },
};

export default async function Page() {
  const projects = await getDemoProjects();

  return (
    /* Seluruh gaya tema ini dikurung `.theme-clay` di globals.css. */
    <main className="theme-clay mx-auto w-full max-w-[86rem] px-6 pb-32 pt-24 sm:px-10">
      <header className="clay-card rounded-[2.5rem] p-8 sm:p-14">
        <span className="eyebrow">Eksperimen 02</span>
        <h1 className="display mt-4 text-[clamp(2.5rem,7vw,5.5rem)]">Claymorphism</h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#6b6191]">
          Semuanya menggembung dan empuk. Tekan kartunya — ia melesak ke dalam, karena
          bayangan luarnya ditukar dengan bayangan dalam, bukan sekadar mengecil.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#karya"
            className="clay-blob rounded-2xl bg-[#C4B5FD] px-7 py-3.5 text-sm font-semibold text-[#3b2f63]"
          >
            Lihat Karya
          </a>
          <a
            href="#karya"
            className="clay-blob rounded-2xl bg-white/80 px-7 py-3.5 text-sm font-semibold text-[#3b2f63]"
          >
            Kontak
          </a>
        </div>
      </header>

      <section id="karya" className="scroll-mt-28 pt-16">
        <h2 className="display mb-8 text-3xl">Karya</h2>
        <ClayGrid projects={projects} />
      </section>
    </main>
  );
}
