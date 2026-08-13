import Link from "next/link";
import Image from "next/image";
// Impor statis: Next membaca dimensi aslinya saat build, jadi ruang gambar sudah
// dipesan sebelum berkasnya turun (tidak ada layout shift).
import avatar from "../../public/avatar.jpg";
import { prisma } from "@/lib/prisma";
import { PROJECT_ORDER, PUBLIC_WHERE, WITH_IMAGES } from "@/lib/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { HeroSequence } from "@/components/HeroSequence";

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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={ikon}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="m3 7 8.2 5.6a1.4 1.4 0 0 0 1.6 0L21 7" strokeLinecap="round" />
  </svg>
);

const IconInstagram = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={ikon}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const IconWhatsApp = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={ikon}>
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
      {/* Tanpa JS, IntersectionObserver tidak jalan — pastikan kartu tetap terlihat. */}
      <noscript>
        <style>{`.slide-in{opacity:1 !important}`}</style>
      </noscript>

      {/* Latar sequence: canvas-nya `fixed`, jadi tidak menempati ruang di
          aliran dokumen. Letaknya di sini murni supaya mudah ditemukan —
          memindahkannya ke mana pun tidak mengubah tata letak. */}
      <HeroSequence />

      {/* ---------- Kepala: tinggal wordmark, menu kanan atas dihapus ---------- */}
      <header className="reveal flex items-center py-8">
        <Link href="/" className="display text-lg">
          Porto
        </Link>
      </header>

      {/* ---------- Hero: 12 kolom, teks berat di kiri, meta menggantung di kanan ---------- */}
      <section className="grid grid-cols-1 gap-10 pb-24 pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-36 lg:pt-28">
        <div className="reveal lg:col-span-8">
          <div className="mb-8 flex items-center gap-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aurora opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-aurora" />
            </span>
            <span className="eyebrow">Lagi terima proyek baru</span>
          </div>

          {/* Kalimatnya utuh "I Build and Host Websites.", dipecah tiga baris supaya
              tiap bagian dapat perlakuan berbeda. Kapitalisasi ditulis langsung di
              teksnya — tidak ada class `uppercase` yang perlu dilepas. Batas atas
              tetap 7.5rem: "Websites." diawali W yang lebar, jadi belum aman
              dikembalikan ke 8rem. */}
          <h1 className="display text-[clamp(2.75rem,8vw,7.5rem)]">
            <span className="block font-light text-mist-400">I Build</span>
            <span className="outlined block">and Host</span>
            <span className="block text-gradient">Websites.</span>
          </h1>
        </div>

        {/* Kolom meta — sengaja turun dan tidak sejajar dengan judul */}
        <aside
          className="reveal flex flex-col justify-end gap-6 lg:col-span-4 lg:pb-4"
          style={{ animationDelay: "140ms" }}
        >
          <div className="flex max-w-md items-start gap-5">
            {/* Cincin gradien tipis sebagai bingkai — menyatu dengan latar gelap
                tanpa garis keras. p-[3px] yang membentuk cincinnya. */}
            <span className="shrink-0 rounded-full bg-gradient-to-br from-aurora/45 via-white/10 to-violet/45 p-[3px] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)]">
              <Image
                src={avatar}
                alt="Foto Alexander Imanuel Joedo"
                priority
                placeholder="blur"
                // Berkasnya hanya 65 KB dan tampil 96–112px. Mengoptimalkan ulang
                // butuh paket `sharp` (~40 MB di image Docker) dan CPU T480 untuk
                // hasil yang nyaris tak berbeda — tidak sepadan.
                unoptimized
                className="h-24 w-24 rounded-full object-cover ring-1 ring-white/15 sm:h-28 sm:w-28"
              />
            </span>

            {/* Ditulis sebagai string JS, bukan teks JSX langsung: apostrof di
                "you're" akan diprotes aturan lint react/no-unescaped-entities. */}
            <p className="text-sm leading-relaxed text-mist-400">
              {
                "Hai, aku Alexander Imanuel Joedo (22 tahun), Fullstack developer asal Petra angkatan 22, anak kedua dari dua bersaudara. Aku suka belajar, ngoprek, dan bermain dengan teknologi. If you're interested, feel free to contact me :)"
              }
            </p>
          </div>

          <dl className="space-y-0">
            {[
              ["Basis", "Indonesia"],
              ["Fokus", "Web · Infrastruktur"],
              ["Server", "ThinkPad T480, 24/7"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="eyebrow shrink-0">{k}</dt>
                <dd className="min-w-0 flex-1 border-b border-dotted border-white/10" />
                <dd className="shrink-0 text-right text-xs text-mist-200">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-3 pt-2">
            {/* Anchor biasa: gulir halus ditangani CSS scroll-behavior di html.
                Tidak ada JS — tidak ada easing buatan yang bikin terasa lamban. */}
            <a
              href="#karya"
              className="btn-glow rounded-full px-6 py-3 text-sm font-semibold text-ink-950"
            >
              Lihat Karya
            </a>
            <a
              href="#contact"
              className="glass rounded-full px-6 py-3 text-sm font-medium text-mist-200 transition-colors hover:border-white/25"
            >
              Contact me
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
              My Projects
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

      {/* ---------- Kaki / Kontak ---------- */}
      <footer id="contact" className="mt-40 scroll-mt-24">
        <hr className="hairline mb-12" />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="eyebrow eyebrow-bright">Kontak</span>
            <p className="display mt-4 text-[clamp(1.75rem,4vw,3rem)] text-mist-200">
              Punya ide? Contact me
            </p>
          </div>

          {/* Tiga kanal kontak, dipisah garis rambut bukan kotak-kotak */}
          <ul className="lg:col-span-7 lg:pt-2">
            {KONTAK.map(({ label, tampil, href, eksternal, icon }) => (
              <li key={label} className="border-t border-white/12 first:border-t-0">
                <a
                  href={href}
                  {...(eksternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-4 py-4 sm:gap-6"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-mist-200 transition-all group-hover:border-aurora/60 group-hover:bg-aurora/10 group-hover:text-aurora">
                    {icon}
                  </span>

                  <span className="eyebrow eyebrow-bright w-24 shrink-0 transition-colors group-hover:text-aurora">
                    {label}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-mist-200 transition-colors group-hover:text-aurora">
                    {tampil}
                  </span>

                  <span className="shrink-0 text-mist-200 transition-all group-hover:translate-x-1.5 group-hover:text-aurora">
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
          <span className="text-xs text-mist-400/70">
            Di-hosting sendiri · Next.js · PostgreSQL · Docker
          </span>
        </div>
      </footer>
    </main>
  );
}
