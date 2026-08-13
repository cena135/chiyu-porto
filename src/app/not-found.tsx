import Link from "next/link";

export const metadata = { title: "Halaman tidak ditemukan" };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="fade-up font-display text-7xl font-semibold tracking-tight text-text">404</p>

      <h1
        className="fade-up font-display mt-6 text-xl font-semibold tracking-tight"
        style={{ animationDelay: "80ms" }}
      >
        Halaman ini tidak ada
      </h1>

      <p
        className="fade-up mt-3 max-w-md text-sm leading-relaxed text-text-dim"
        style={{ animationDelay: "140ms" }}
      >
        Mungkin proyeknya sudah dihapus, atau masih berstatus draf sehingga belum tayang untuk
        publik.
      </p>

      <div className="fade-up mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "200ms" }}>
        <Link
          href="/#karya"
          className="rounded-full bg-text px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
        >
          Lihat Daftar Proyek
        </Link>
        <Link
          href="/"
          className="glass rounded-full px-6 py-3 text-sm font-medium text-text transition-colors hover:border-white/25"
        >
          Ke Beranda
        </Link>
      </div>
    </main>
  );
}
