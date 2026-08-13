import { cn } from "@/lib/utils";

/**
 * Latar titik bergaya Magic UI — tekstur arsitektural yang nyaris tak terasa.
 *
 * Satu <svg> dengan <pattern> yang diulang browser. Bukan ratusan elemen, bukan
 * gambar yang perlu diunduh: biayanya praktis nol dan tidak ada apa pun yang
 * berjalan saat halaman digulir.
 *
 * Titiknya sengaja dipudarkan ke tepi lewat mask radial. Tanpa itu, pola akan
 * berhenti mendadak di batas seksi dan justru terlihat seperti cacat render.
 */
export function DotPattern({
  width = 18,
  height = 18,
  radius = 1,
  className,
  id = "dot-pattern",
}: {
  width?: number;
  height?: number;
  radius?: number;
  className?: string;
  /** Wajib unik kalau dipakai lebih dari sekali di satu halaman. */
  id?: string;
}) {
  return (
    <svg
      aria-hidden
      className={cn(
        // fill putih 6% — cukup memberi tekstur, jauh di bawah ambang yang
        // mulai mengganggu keterbacaan teks di atasnya.
        "pointer-events-none absolute inset-0 h-full w-full fill-white/[0.06]",
        className,
      )}
      style={{
        maskImage: "radial-gradient(60% 60% at 50% 40%, #000 20%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(60% 60% at 50% 40%, #000 20%, transparent 100%)",
      }}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse">
          <circle cx={radius + 1} cy={radius + 1} r={radius} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
