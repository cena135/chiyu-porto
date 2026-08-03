import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PROJECT_ORDER, WITH_IMAGES } from "@/lib/projects";
import { ProjectCard } from "@/components/ProjectCard";

// Grid tumbuh otomatis: revalidate tiap 60 detik + di-revalidate manual saat admin CRUD.
export const revalidate = 60;

async function getProjects() {
  try {
    return await prisma.project.findMany({
      where: { published: true },
      orderBy: PROJECT_ORDER,
      include: WITH_IMAGES,
    });
  } catch {
    return []; // DB belum siap (mis. saat build) — halaman tetap render.
  }
}

export default async function HomePage() {
  const projects = await getProjects();
  const stacks = [...new Set(projects.flatMap((p) => p.techStack))];
  const tahun = new Date().getFullYear();

  return (
    <main className="mx-auto w-full max-w-[86rem] px-6 pb-32 sm:px-10">
      {/* Tanpa JS, IntersectionObserver tidak jalan — pastikan kartu tetap terlihat. */}
      <noscript>
        <style>{`.slide-in{opacity:1 !important}`}</style>
      </noscript>

      {/* ---------- Navigasi ---------- */}
      <header className="reveal flex items-center justify-between gap-4 py-8">
        <Link href="/" className="display text-lg">
          chiyu<span className="text-aurora">.</span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="#karya" className="eyebrow transition-colors hover:text-mist-200">
            Karya
          </a>
          <Link href="/admin" className="eyebrow transition-colors hover:text-mist-200">
            Admin
          </Link>
        </div>
      </header>

      {/* ---------- Hero: 12 kolom, teks berat di kiri, meta menggantung di kanan ---------- */}
      <section className="grid grid-cols-1 gap-10 pb-24 pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-36 lg:pt-28">
        <div className="reveal lg:col-span-8">
          <div className="mb-8 flex items-center gap-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aurora opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-aurora" />
            </span>
            <span className="eyebrow">Tersedia untuk proyek baru</span>
          </div>

          <h1 className="display text-[clamp(2.75rem,8.5vw,7rem)]">
            <span className="block font-light text-mist-400">Saya membangun</span>
            <span className="block text-mist-200">produk digital</span>
            <span className="outlined block">yang terasa</span>
            <span className="block text-gradient">mahal.</span>
          </h1>
        </div>

        {/* Kolom meta — sengaja turun dan tidak sejajar dengan judul */}
        <aside
          className="reveal flex flex-col justify-end gap-6 lg:col-span-4 lg:pb-4"
          style={{ animationDelay: "140ms" }}
        >
          <p className="max-w-sm text-sm leading-relaxed text-mist-400">
            Fullstack developer yang meng-<i>hosting</i> semuanya sendiri. Dari kode sampai
            server fisik di pojok ruangan — tanpa cloud, tanpa tagihan bulanan.
          </p>

          <dl className="space-y-0">
            {[
              ["Basis", "Indonesia"],
              ["Fokus", "Web · Infrastruktur"],
              ["Server", "ThinkPad T480, 24/7"],
              ["Proyek", `${projects.length} dipublikasikan`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="eyebrow shrink-0">{k}</dt>
                <dd className="min-w-0 flex-1 border-b border-dotted border-white/10" />
                <dd className="shrink-0 text-right text-xs text-mist-200">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#karya"
              className="btn-glow rounded-full px-6 py-3 text-sm font-semibold text-ink-950"
            >
              Lihat Karya
            </a>
            <a
              href="mailto:hello@chiyu.my.id"
              className="glass rounded-full px-6 py-3 text-sm font-medium text-mist-200 transition-colors hover:border-white/25"
            >
              Hubungi Saya
            </a>
          </div>
        </aside>
      </section>

      {/* ---------- Ticker tech stack ---------- */}
      {stacks.length > 0 && (
        <div className="reveal border-y border-white/8 py-5">
          <div className="ticker">
            <div className="ticker-track">
              {/* Digandakan supaya sambungan gulirnya tidak terlihat */}
              {[...stacks, ...stacks].map((s, i) => (
                <span key={`${s}-${i}`} className="eyebrow flex items-center gap-2.5">
                  <span className="text-aurora/50">✦</span>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Indeks karya ---------- */}
      <section id="karya" className="pt-28">
        <div className="reveal mb-16 grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="eyebrow">Indeks · 01</span>
            <h2 className="display mt-4 text-[clamp(2rem,5vw,3.75rem)] text-mist-200">
              Karya Terpilih
            </h2>
          </div>
          <div className="lg:col-span-5 lg:text-right">
            <p className="text-sm leading-relaxed text-mist-400">
              Sebagian dibangun untuk klien, sebagian untuk rasa penasaran sendiri.
            </p>
          </div>
        </div>
        <hr className="hairline reveal mb-14" />

        {projects.length === 0 ? (
          <div className="glass radius-organic reveal px-8 py-24 text-center">
            <p className="display text-2xl text-mist-200">Belum ada apa-apa di sini.</p>
            <p className="mt-3 text-sm text-mist-400">
              Masuk ke{" "}
              <Link href="/admin" className="text-aurora underline-offset-4 hover:underline">
                panel admin
              </Link>{" "}
              untuk menambahkan proyek pertama.
            </p>
          </div>
        ) : (
          <div className="work-grid">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- Kaki ---------- */}
      <footer className="mt-40">
        <hr className="hairline mb-10" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="display text-[clamp(1.75rem,4vw,3rem)] text-mist-200">
              Punya ide yang layak dibangun?
            </p>
            <a
              href="mailto:hello@chiyu.my.id"
              className="group mt-5 inline-flex items-center gap-3 text-sm text-aurora"
            >
              hello@chiyu.my.id
              <span className="transition-transform group-hover:translate-x-1.5">→</span>
            </a>
          </div>
          <div className="flex flex-col justify-end gap-2 lg:col-span-5 lg:items-end">
            <span className="eyebrow">© {tahun} chiyu.my.id</span>
            <span className="text-xs text-mist-400/70">
              Di-hosting sendiri · Next.js · PostgreSQL · Docker
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
