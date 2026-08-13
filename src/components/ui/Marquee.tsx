"use client";

/**
 * Deretan yang menggeser tanpa henti (gaya Magic UI).
 *
 * Isinya digandakan DUA KALI dan jalurnya digeser tepat -50%; karena kedua
 * separuhnya identik, titik ulang jatuh persis di posisi semula sehingga
 * sambungannya tidak terlihat. Salinan kedua ditandai `aria-hidden` supaya
 * pembaca layar tidak membacakan daftar yang sama dua kali.
 *
 * Berhenti saat disorot — daftar yang bergerak terus membuat isinya mustahil
 * dibaca kalau ada yang ingin memastikan satu nama.
 */
export function Marquee({
  items,
  durasi = 22,
  className = "",
}: {
  items: string[];
  /** Detik untuk satu putaran penuh. Makin banyak isi, makin panjang jalurnya. */
  durasi?: number;
  className?: string;
}) {
  const jalur = (tersembunyi: boolean) => (
    <div className="flex shrink-0 items-center gap-3 pr-3" aria-hidden={tersembunyi}>
      {items.map((s, i) => (
        <span
          key={`${s}-${i}`}
          className="whitespace-nowrap rounded-full border border-line bg-black/[0.03] px-3.5 py-1.5 text-xs font-semibold text-text-dim"
        >
          {s}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`marquee relative overflow-hidden ${className}`}
      // Kedua tepinya dipudarkan supaya isinya terlihat "masuk dan keluar"
      // kotak, bukan terpotong mendadak.
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
      }}
    >
      <div
        className="marquee-track"
        style={{ ["--marquee-dur" as string]: `${durasi}s` }}
      >
        {jalur(false)}
        {jalur(true)}
      </div>
    </div>
  );
}
