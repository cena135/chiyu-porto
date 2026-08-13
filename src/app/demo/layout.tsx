import Link from "next/link";

/**
 * Kerangka bersama tiga halaman demo.
 *
 * Pengalih tema dibuat `fixed` supaya CEO bisa melompat antar versi tanpa
 * menggulir balik ke atas — inti dari uji A/B adalah membandingkan cepat.
 */
const VERSI = [
  { href: "/demo/v1", label: "V1", nama: "Bento Grid" },
  { href: "/demo/v2", label: "V2", nama: "Liquid Glass" },
  { href: "/demo/v3", label: "V3", nama: "Hacker" },
];

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="glass fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5">
        {VERSI.map((v) => (
          <Link
            key={v.href}
            href={v.href}
            className="rounded-full px-3.5 py-1.5 text-xs font-medium text-text-dim transition-colors hover:bg-white/10 hover:text-text"
          >
            <span className="font-semibold">{v.label}</span>
            <span className="ml-1.5 hidden sm:inline">{v.nama}</span>
          </Link>
        ))}
        <Link
          href="/"
          className="ml-1 rounded-full px-3.5 py-1.5 text-xs text-text-dim transition-colors hover:bg-white/10 hover:text-text"
        >
          ← Situs
        </Link>
      </nav>

      {children}
    </>
  );
}
