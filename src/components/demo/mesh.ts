/**
 * Palet dan bentuk gradien yang dipakai bersama ketiga varian kartu demo.
 *
 * Dipilih lewat `index % PALETTES.length`, bukan hash judul: cara ini MENJAMIN
 * dua baris bersebelahan tidak pernah kembar warnanya.
 */
export const PALETTES: [string, string, string][] = [
  ["#6366f166", "#a855f74d", "#22d3ee4d"], // indigo · violet · cyan
  ["#fb718566", "#f59e0b4d", "#f472b64d"], // rose · amber · pink
  ["#34d39966", "#14b8a64d", "#38bdf84d"], // emerald · teal · sky
  ["#a78bfa66", "#f472b64d", "#fbbf244d"], // violet · pink · amber
  ["#22d3ee66", "#3b82f64d", "#8b5cf64d"], // cyan · blue · violet
  ["#e879f966", "#8b5cf64d", "#6366f14d"], // fuchsia · violet · indigo
  ["#a3e63566", "#34d3994d", "#22d3ee4d"], // lime · emerald · cyan
  ["#38bdf866", "#6366f14d", "#fb71854d"], // sky · indigo · rose
];

/** Panel ramping: titik cahaya disebar MENDATAR, mengikuti bentuk baris. */
export function meshPanel([a, b, c]: [string, string, string]) {
  return [
    `radial-gradient(90% 160% at 10% 20%, ${a} 0%, transparent 60%)`,
    `radial-gradient(80% 150% at 55% 90%, ${b} 0%, transparent 58%)`,
    `radial-gradient(90% 160% at 95% 15%, ${c} 0%, transparent 60%)`,
  ].join(", ");
}

/** Sapuan warna selebar baris, dipakai saat baris disorot. */
export function meshRow([a, b, c]: [string, string, string]) {
  return [
    `radial-gradient(40% 180% at 8% 50%, ${a} 0%, transparent 70%)`,
    `radial-gradient(35% 160% at 45% 50%, ${b} 0%, transparent 70%)`,
    `radial-gradient(40% 180% at 85% 50%, ${c} 0%, transparent 70%)`,
  ].join(", ");
}
