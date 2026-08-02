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
  const stacks = [...new Set(projects.flatMap((p) => p.techStack))].slice(
    0,
    12,
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-28 pt-16 sm:pt-24">
      {/* Tanpa JS, IntersectionObserver tidak jalan — pastikan kartu tetap terlihat. */}
      <noscript>
        <style>{`.slide-in{opacity:1 !important}`}</style>
      </noscript>

      <header className="reveal flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight"
        >
          chiyu<span className="text-aurora">.</span>
        </Link>
        <Link
          href="/admin"
          className="glass rounded-full px-4 py-2 text-xs font-medium text-mist-400 transition-colors hover:text-mist-200"
        >
          Admin
        </Link>
      </header>

      <section
        className="reveal py-20 sm:py-28"
        style={{ animationDelay: "80ms" }}
      >
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-mist-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aurora" />
          Tersedia untuk proyek baru
        </span>

        <h1 className="font-display mt-7 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Saya membangun <span className="text-gradient">produk digital</span>{" "}
          yang rapi, cepat, dan enak dipakai.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-mist-400">
          Kumpulan proyek fullstack, eksperimen infrastruktur, dan hal-hal yang
          saya kerjakan di waktu luang. Semuanya self-hosted.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
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

        {stacks.length > 0 && (
          <div className="mt-14 flex flex-wrap gap-2 opacity-70">
            {stacks.map((s) => (
              <span key={s} className="text-xs tracking-wide text-mist-400">
                {s} <span className="px-1.5 text-ink-700">/</span>
              </span>
            ))}
          </div>
        )}
      </section>

      <section id="karya" className="scroll-mt-20">
        <div className="reveal mb-10 flex items-end justify-between gap-6 border-b border-white/8 pb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Karya Terpilih
            </h2>
            <p className="mt-2 text-sm text-mist-400">
              {projects.length} proyek dipublikasikan
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="glass reveal rounded-3xl px-8 py-20 text-center">
            <p className="font-display text-lg text-mist-200">
              Belum ada proyek di sini.
            </p>
            <p className="mt-2 text-sm text-mist-400">
              Masuk ke{" "}
              <Link
                href="/admin"
                className="text-aurora underline-offset-4 hover:underline"
              >
                panel admin
              </Link>{" "}
              untuk menambahkan proyek pertama.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </section>

      <footer className="mt-28 border-t border-white/8 pt-8 text-xs text-mist-400">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>
            © {new Date().getFullYear()} chiyu.my.id — self-hosted di rumah.
          </span>
          <span>Next.js · PostgreSQL · Docker · Cloudflare Tunnel</span>
        </div>
      </footer>
    </main>
  );
}
