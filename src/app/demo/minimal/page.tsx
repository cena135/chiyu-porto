import type { Metadata } from "next";
import { getDemoProjects } from "../_data";
import { MinimalGrid } from "./MinimalGrid";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Demo · Apple Minimalism",
  robots: { index: false },
};

export default async function Page() {
  const projects = await getDemoProjects();

  return (
    /* Seluruh gaya tema ini dikurung `.theme-minimal` di globals.css.
       Lebar dibatasi 72rem, bukan 86rem seperti tema lain: baris teks yang
       terlalu panjang melelahkan dibaca, dan tema ini tidak punya kotak atau
       garis untuk memotongnya. */
    <main className="theme-minimal mx-auto w-full max-w-[72rem] px-6 pb-48 pt-40 sm:px-10">
      <header className="pb-40">
        <span className="eyebrow">Eksperimen 03</span>
        <h1 className="display mt-10 text-[clamp(3rem,9vw,7rem)]">
          Sesedikit
          <br />
          mungkin.
        </h1>
        <p className="mt-12 max-w-lg text-lg font-light leading-relaxed text-[#86868b]">
          Tanpa garis, tanpa bayangan, tanpa warna. Yang memisahkan satu bagian dari yang
          lain hanyalah jarak — itu sebabnya jaraknya sengaja terasa berlebihan.
        </p>
        <a
          href="#karya"
          className="mt-14 inline-block rounded-full bg-[#1d1d1f] px-8 py-3.5 text-sm font-normal text-white transition-opacity hover:opacity-80"
        >
          Lihat Karya
        </a>
      </header>

      <section id="karya" className="scroll-mt-28">
        <span className="eyebrow">Karya</span>
        <div className="mt-16">
          <MinimalGrid projects={projects} />
        </div>
      </section>
    </main>
  );
}
