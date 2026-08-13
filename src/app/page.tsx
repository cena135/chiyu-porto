import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PROJECT_ORDER, PUBLIC_WHERE, WITH_IMAGES } from "@/lib/projects";
import { Bento } from "@/components/Bento";
import { ContactBento } from "@/components/ContactBento";

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
 * force-dynamic membuat Next mengirim `no-store`, jadi selalu segar. Biayanya
 * satu query Prisma per permintaan atas 6 baris di Postgres lokal — tidak berarti
 * untuk trafik situs ini.
 */
export const dynamic = "force-dynamic";

async function getProjects() {
  try {
    return await prisma.project.findMany({
      where: PUBLIC_WHERE,
      orderBy: PROJECT_ORDER,
      include: WITH_IMAGES,
    });
  } catch {
    return []; // DB belum siap (mis. saat build) — halaman tetap render.
  }
}

export default async function HomePage() {
  const projects = await getProjects();
  const tahun = new Date().getFullYear();

  return (
    <main className="mx-auto w-full max-w-[86rem] px-6 pb-24 sm:px-10">
      {/* Tanpa JS, Framer Motion tidak menjalankan whileInView — pastikan
          kotak bento tidak tersangkut tak terlihat. */}
      <noscript>
        <style>{`.bento{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      <header className="fade-up flex items-center py-8">
        <Link href="/" className="display text-lg">
          Porto
        </Link>
      </header>

      <Bento projects={projects} />

      <ContactBento />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-8">
        <span className="eyebrow">© {tahun} Alexander Imanuel Joedo</span>
        <span className="text-xs text-text-dim">
          Di-hosting sendiri · Next.js · PostgreSQL · Docker
        </span>
      </div>
    </main>
  );
}
