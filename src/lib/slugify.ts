/**
 * Dipisah ke berkasnya sendiri karena dipakai DUA sisi:
 * form admin di browser dan API di server.
 *
 * Tidak boleh diletakkan di `lib/projects.ts` — berkas itu meng-import Prisma,
 * dan meng-import-nya dari komponen klien akan menyeret Prisma ke bundel browser.
 *
 * Konsekuensi kalau ada dua salinan yang menyimpang: pratinjau URL di form
 * berbeda dengan slug yang benar-benar tersimpan. Satu sumber, satu hasil.
 */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "") // buang tanda baca
    .trim()
    .replace(/[\s_-]+/g, "-") // spasi & garis bawah jadi strip
    .replace(/^-+|-+$/g, "") // rapikan strip di ujung
    .slice(0, 80);
}
