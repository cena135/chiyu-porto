import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PROJECT_ORDER, PUBLIC_WHERE, WITH_IMAGES } from "@/lib/projects";
import { ThemeShowcase } from "@/components/themes/ThemeShowcase";
import type { ThemeProject } from "@/components/themes/types";

/**
 * Selalu render ulang per permintaan — JANGAN kembalikan ke `revalidate`.
 *
 * Dengan ISR, Next mengirim `s-maxage=60, stale-while-revalidate=31535940`.
 * `s-maxage` cuma berlaku untuk cache bersama (CDN), padahal Cloudflare di depan
 * kita tidak mencache HTML sama sekali (cf-cache-status: DYNAMIC) — jadi tidak
 * ada manfaatnya. Yang tersisa justru `stale-while-revalidate` ~1 tahun yang
 * DIPATUHI BROWSER: pengunjung disuguhi salinan basi lebih dulu, dan proyek baru
 * baru muncul setelah hard refresh.
 *
 * force-dynamic membuat Next mengirim `no-store`, jadi selalu segar.
 */
export const dynamic = "force-dynamic";

/** Data dipetakan ke bentuk netral DI SINI, sekali, bukan di sembilan tema.
 *  Tak satu pun komponen tema perlu tahu apa pun tentang skema Prisma. */
async function getProjects(): Promise<ThemeProject[]> {
  try {
    const rows = await prisma.project.findMany({
      where: PUBLIC_WHERE,
      orderBy: PROJECT_ORDER,
      include: WITH_IMAGES,
    });
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      techStack: p.techStack,
      isWip: p.isWip,
      cover: p.images[0]?.url ?? null,
    }));
  } catch {
    return []; // DB belum siap (mis. saat build) — halaman tetap render.
  }
}

export default async function HomePage() {
  const projects = await getProjects();
  const tahun = new Date().getFullYear();

  return (
    <>
      {/* Tanpa JS, Framer Motion tidak menjalankan whileInView — pastikan
          kotak bento tidak tersangkut tak terlihat. */}
      <noscript>
        <style>{`.bento{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      <header className="fade-up mx-auto flex w-full max-w-[86rem] items-center px-6 py-8 sm:px-10">
        <Link href="/" className="display text-lg">
          Porto
        </Link>
      </header>

      <ThemeShowcase projects={projects} />

      <footer className="mx-auto w-full max-w-[86rem] px-6 pb-10 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-current/10 pt-8">
          <span className="eyebrow">© {tahun} Alexander Imanuel Joedo</span>
          <span className="text-xs opacity-60">
            Di-hosting sendiri · Next.js · PostgreSQL · Docker
          </span>
        </div>
      </footer>
    </>
  );
}
