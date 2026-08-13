import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PROJECT_ORDER, PUBLIC_WHERE, WITH_IMAGES } from "@/lib/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { Hero } from "@/components/Hero";
import { RevealText } from "@/components/ui/RevealText";

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

/** Ikon digambar inline sebagai SVG — tidak menambah dependensi maupun request. */
const ikon = "h-[18px] w-[18px]";

const IconMail = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    className={ikon}
  >
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="m3 7 8.2 5.6a1.4 1.4 0 0 0 1.6 0L21 7" strokeLinecap="round" />
  </svg>
);

const IconInstagram = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    className={ikon}
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const IconWhatsApp = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    className={ikon}
  >
    <path d="M3.8 20.2l1.2-4a8 8 0 1 1 3 3l-4.2 1z" strokeLinejoin="round" />
    <path
      d="M9 8.6c.3-.1.6 0 .8.3l.7 1.2c.1.3.1.6-.1.8l-.5.5a5.4 5.4 0 0 0 2.7 2.7l.5-.5c.2-.2.5-.2.8-.1l1.2.7c.3.2.4.5.3.8-.3.9-1.2 1.4-2.1 1.2A7.4 7.4 0 0 1 7.8 10c-.2-.9.3-1.8 1.2-2.1z"
      strokeLinejoin="round"
    />
  </svg>
);

const KONTAK = [
  {
    label: "Email",
    tampil: "alexanderjoedo@gmail.com",
    // Buka jendela tulis Gmail di web, bukan mailto: — banyak orang tidak punya
    // aplikasi email terpasang, dan mailto pada mereka tidak melakukan apa-apa.
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=alexanderjoedo@gmail.com",
    eksternal: true,
    icon: IconMail,
  },
  {
    label: "Instagram",
    tampil: "@alexander_joedo",
    href: "https://instagram.com/alexander_joedo",
    eksternal: true,
    icon: IconInstagram,
  },
  {
    label: "WhatsApp",
    tampil: "081252729777",
    // Nomor dipakai dalam format internasional (62...) karena wa.me menolak awalan 0.
    href: "https://wa.me/6281252729777?text=Hai%20alex%2C%20aku%20tertarik%20untuk%20diskusi%20projek",
    eksternal: true,
    icon: IconWhatsApp,
  },
];

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
  const stacks = [...new Set(projects.flatMap((p) => p.techStack))];
  const tahun = new Date().getFullYear();

  return (
    <main className="mx-auto w-full max-w-[86rem] px-6 pb-32 sm:px-10">
      {/* Tanpa JS, Framer Motion tidak menjalankan whileInView — pastikan
          kartu proyek tidak tersangkut tak terlihat. */}
      <noscript>
        <style>{`[data-motion-card]{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      {/* ---------- Pintasan uji A/B (SEMENTARA) ----------
          Fixed di pojok kanan bawah supaya tidak mengganggu tata letak dan
          tetap terjangkau dari posisi gulir mana pun. Hapus blok ini setelah
          satu tema dipilih. */}
      <div className="glass fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full p-1.5">
        <span className="px-2 text-[10px] uppercase tracking-[0.18em] text-text-dim">
          Demo
        </span>
        {["v1", "v2", "v3"].map((v) => (
          <Link
            key={v}
            href={`/demo/${v}`}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-text-dim transition-colors hover:bg-white/10 hover:text-text"
          >
            {v.toUpperCase()}
          </Link>
        ))}
      </div>

      {/* ---------- Kepala: tinggal wordmark, menu kanan atas dihapus ---------- */}
      <header className="fade-up flex items-center py-8">
        <Link href="/" className="display text-lg">
          Porto
        </Link>
      </header>

      <Hero />

      {/* ---------- Ticker tech stack ---------- */}
      {stacks.length > 0 && (
        <div className="fade-up border-y border-white/8 py-5">
          <div className="ticker">
            <div className="ticker-track">
              {/* Digandakan supaya sambungan gulirnya tidak terlihat */}
              {[...stacks, ...stacks].map((s, i) => (
                <span
                  key={`${s}-${i}`}
                  className="eyebrow flex items-center gap-2.5"
                >
                  <span className="text-text/50">✦</span>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Indeks karya ---------- */}
      <section id="karya" className="pt-28">
        <div className="fade-up mb-16 grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="eyebrow">Indeks · 01</span>
            <h2 className="display mt-4 text-[clamp(2rem,5vw,3.75rem)] text-text">
              My Projects
            </h2>
          </div>
          <div className="lg:col-span-5 lg:text-right">
            <p className="text-sm leading-relaxed text-text-dim">
              Sebagian dibangun untuk klien, sebagian untuk rasa penasaran
              sendiri.
            </p>
          </div>
        </div>
        <hr className="hairline fade-up mb-14" />

        {projects.length === 0 ? (
          <div className="glass radius-modern fade-up px-8 py-24 text-center">
            <p className="display text-2xl text-text">
              Belum ada apa-apa di sini.
            </p>
            <p className="mt-3 text-sm text-text-dim">
              Masuk ke{" "}
              <Link
                href="/admin"
                className="text-text underline-offset-4 hover:underline"
              >
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

      {/* ---------- Kaki / Kontak ---------- */}
      <footer id="contact" className="mt-40 scroll-mt-24">
        <hr className="hairline mb-12" />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="eyebrow eyebrow-bright">Kontak</span>
            <p className="display mt-4 text-[clamp(1.75rem,4vw,3rem)] text-text">
              Punya ide? Contact me
            </p>
          </div>

          {/* Tiga kanal kontak, dipisah garis rambut bukan kotak-kotak */}
          <ul className="lg:col-span-7 lg:pt-2">
            {KONTAK.map(({ label, tampil, href, eksternal, icon }) => (
              <li
                key={label}
                className="border-t border-white/12 first:border-t-0"
              >
                <a
                  href={href}
                  {...(eksternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex items-center gap-4 py-4 sm:gap-6"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-text transition-all group-hover:border-text/60 group-hover:bg-text/10 group-hover:text-text">
                    {icon}
                  </span>

                  <span className="eyebrow eyebrow-bright w-24 shrink-0 transition-colors group-hover:text-text">
                    {label}
                  </span>

                  {/* Bergulir seperti silinder saat disorot: teks terlempar ke
                      atas, salinannya masuk dari bawah. */}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
                    <RevealText swap={tampil}>{tampil}</RevealText>
                  </span>

                  <span className="shrink-0 text-text transition-all group-hover:translate-x-1.5 group-hover:text-text">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <hr className="hairline mt-14" />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <span className="eyebrow">© {tahun} Alexander Imanuel Joedo</span>
          <span className="text-xs text-text-dim/70">
            Di-hosting sendiri · Next.js · PostgreSQL · Docker
          </span>
        </div>
      </footer>
    </main>
  );
}
