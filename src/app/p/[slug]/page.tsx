import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PUBLIC_WHERE, WITH_IMAGES } from "@/lib/projects";
import { ProjectGallery } from "@/components/ProjectGallery";

// Alasan sama seperti di src/app/page.tsx: ISR mengirim stale-while-revalidate
// ~1 tahun yang dipatuhi browser, sehingga hasil edit admin telat muncul.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

/** Hanya proyek yang sudah dipublikasikan boleh diakses publik — draf tetap 404. */
async function getProject(slug: string) {
  try {
    return await prisma.project.findFirst({
      where: { slug, ...PUBLIC_WHERE },
      include: WITH_IMAGES,
    });
  } catch {
    return null; // DB belum siap (mis. saat build)
  }
}

// generateStaticParams dihapus: tidak ada gunanya berdampingan dengan
// force-dynamic, karena halaman tetap dirender per permintaan.

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
    <main className="mx-auto w-full max-w-[76rem] px-6 pb-32 pt-8 sm:px-10">
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
          Porto
        </Link>
      </nav>

      {/* ---------- Kepala: judul raksasa di kiri, meta menggantung di kanan ---------- */}
      <header className="reveal py-14 sm:py-20" style={{ animationDelay: "80ms" }}>
        <div className="flex flex-wrap items-center gap-4">
          {project.featured && <span className="eyebrow text-aurora">Unggulan</span>}
          <span className="eyebrow">{dibuat}</span>
          {project.images.length > 0 && (
            <span className="eyebrow">{project.images.length} screenshot</span>
          )}
        </div>

        <h1 className="display mt-6 text-[clamp(2.5rem,7vw,5.5rem)]">
          <span className="text-gradient">{project.title}</span>
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <p className="text-base leading-relaxed text-mist-400 lg:col-span-7">
            {project.description}
          </p>

          {project.techStack.length > 0 && (
            <dl className="lg:col-span-5">
              <dt className="eyebrow mb-3">Dibangun dengan</dt>
              <dd className="flex flex-wrap gap-x-5 gap-y-2">
                {project.techStack.map((tech) => (
                  <span key={tech} className="text-sm text-mist-200">
                    {tech}
                  </span>
                ))}
              </dd>
            </dl>
          )}
        </div>

        <hr className="hairline mt-10" />

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
          className="radius-organic reveal mt-10 border border-white/8 bg-ink-900/30 p-8 backdrop-blur-xl sm:p-11"
          style={{ animationDelay: "220ms" }}
        >
          <span className="eyebrow">Catatan</span>
          <h2 className="display mt-3 text-[clamp(1.5rem,3vw,2.25rem)] text-mist-200">
            Tentang Proyek Ini
          </h2>
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
