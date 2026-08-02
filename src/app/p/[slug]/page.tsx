import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WITH_IMAGES } from "@/lib/projects";
import { ProjectGallery } from "@/components/ProjectGallery";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

/** Hanya proyek yang sudah dipublikasikan boleh diakses publik — draf tetap 404. */
async function getProject(slug: string) {
  try {
    return await prisma.project.findFirst({
      where: { slug, published: true },
      include: WITH_IMAGES,
    });
  } catch {
    return null; // DB belum siap (mis. saat build)
  }
}

/** Pra-render halaman detail proyek yang sudah ada; slug baru tetap dilayani on-demand. */
export async function generateStaticParams() {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Proyek tidak ditemukan" };

  const cover = project.images[0]?.url;
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      type: "article",
      title: project.title,
      description: project.description,
      url: `/p/${project.slug}`,
      images: cover ? [{ url: cover }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const dibuat = new Date(project.createdAt).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-28 pt-10 sm:pt-14">
      {/* ---------- Navigasi atas ---------- */}
      <nav className="reveal flex items-center justify-between gap-4">
        <Link
          href="/#karya"
          className="glass group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-mist-400 transition-all hover:border-white/25 hover:text-mist-200"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
          Kembali ke daftar proyek
        </Link>
        <Link
          href="/"
          className="font-display text-sm font-semibold tracking-tight text-mist-400 transition-colors hover:text-mist-200"
        >
          chiyu<span className="text-aurora">.</span>
        </Link>
      </nav>

      {/* ---------- Kepala ---------- */}
      <header className="reveal py-12 sm:py-16" style={{ animationDelay: "80ms" }}>
        <div className="flex flex-wrap items-center gap-3">
          {project.featured && (
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-aurora backdrop-blur-md">
              Unggulan
            </span>
          )}
          <span className="text-[11px] tracking-wide text-mist-400/70">{dibuat}</span>
          {project.images.length > 0 && (
            <span className="text-[11px] tracking-wide text-mist-400/70">
              · {project.images.length} screenshot
            </span>
          )}
        </div>

        <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          <span className="text-gradient">{project.title}</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-mist-400">
          {project.description}
        </p>

        {project.techStack.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="glass rounded-full px-3 py-1.5 text-xs text-mist-200 transition-colors hover:border-white/25"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {(project.liveUrl || project.repoUrl) && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink-950"
              >
                Buka Situs
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  ↗
                </span>
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-full px-6 py-3 text-sm font-medium text-mist-200 transition-colors hover:border-white/25"
              >
                Lihat Source Code
              </a>
            )}
          </div>
        )}
      </header>

      {/* ---------- Galeri ---------- */}
      <div className="reveal" style={{ animationDelay: "160ms" }}>
        <ProjectGallery images={project.images} title={project.title} />
      </div>

      {/* ---------- Catatan panjang ---------- */}
      {project.content && (
        <section
          className="glass reveal mt-8 rounded-3xl p-7 sm:p-9"
          style={{ animationDelay: "220ms" }}
        >
          <h2 className="font-display text-lg font-semibold tracking-tight">Tentang Proyek Ini</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-mist-400">
            {project.content.split(/\n\s*\n/).map((paragraf, i) => (
              <p key={i} className="whitespace-pre-line">
                {paragraf}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Kaki ---------- */}
      <footer className="mt-16 border-t border-white/8 pt-8">
        <Link
          href="/#karya"
          className="glass group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium text-mist-400 transition-all hover:border-white/25 hover:text-mist-200"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
          Kembali ke daftar proyek
        </Link>
      </footer>
    </main>
  );
}
