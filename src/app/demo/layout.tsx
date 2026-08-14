import Link from "next/link";

/**
 * Kerangka bersama tiga halaman demo eksperimental.
 *
 * Pengalih dibuat `fixed` supaya CEO bisa melompat antar tema tanpa menggulir
 * balik ke atas — inti dari perbandingan adalah bisa bolak-balik dengan cepat.
 *
 * Gayanya sengaja NETRAL (putih, garis tipis, tanpa kepribadian): kalau
 * pengalihnya ikut bergaya, ia akan mencampuri kesan tema yang sedang dinilai.
 */
const VERSI = [
  { href: "/demo/neo", label: "Neo", nama: "Brutalism" },
  { href: "/demo/clay", label: "Clay", nama: "Claymorphism" },
  { href: "/demo/minimal", label: "Min", nama: "Minimalism" },
];

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-black/10 bg-white/95 p-1.5 shadow-[0_12px_30px_-12px_rgb(0_0_0/0.3)] backdrop-blur-sm">
        {VERSI.map((v) => (
          <Link
            key={v.href}
            href={v.href}
            title={`Lihat tema ${v.nama}`}
            className="rounded-full px-3.5 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-black/5 hover:text-black"
          >
            <span className="font-semibold text-black">{v.label}</span>
            <span className="ml-1.5 hidden sm:inline">{v.nama}</span>
          </Link>
        ))}
        <Link
          href="/"
          title="Kembali ke situs utama"
          className="ml-1 rounded-full px-3.5 py-1.5 text-xs text-neutral-500 transition-colors hover:bg-black/5 hover:text-black"
        >
          ← Situs
        </Link>
      </nav>

      {children}
    </>
  );
}
