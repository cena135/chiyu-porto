"use client";

/**
 * Tautan anchor yang menggulir dengan JavaScript, tidak bergantung pada
 * `scroll-behavior` CSS.
 *
 * Kenapa perlu: CSS `scroll-behavior: smooth` gampang lumpuh — cukup ada
 * `overflow` di body, atau elemen penggulirnya bukan `html`, efeknya hilang
 * dan halaman melompat instan. Handler ini memaksa animasi lewat
 * `scrollIntoView`, jadi hasilnya tidak bergantung pada tata letak.
 *
 * Tetap memakai <a href="#..."> supaya klik-tengah, buka di tab baru, dan
 * mode tanpa JavaScript semuanya masih berfungsi normal.
 */
export function SmoothScrollLink({
  targetId,
  children,
  className,
  offset = 80,
}: {
  targetId: string;
  children: React.ReactNode;
  className?: string;
  offset?: number;
}) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Biarkan browser menangani klik-tengah / Ctrl+klik (buka tab baru).
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    const target = document.getElementById(targetId);
    if (!target) return; // target hilang -> biarkan perilaku anchor bawaan

    e.preventDefault();

    // scrollTo pada window: lebih bisa diramalkan daripada scrollIntoView, yang
    // hasilnya bisa berbeda kalau ada leluhur yang ikut menggulir.
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });

    // Perbarui alamat tanpa memicu lompatan anchor bawaan.
    history.replaceState(null, "", `#${targetId}`);
  }

  return (
    <a href={`#${targetId}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
