import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Gabungkan className secara aman.
 *
 * `clsx` merangkai nilai kondisional; `twMerge` membuang utilitas Tailwind yang
 * saling bertabrakan sehingga yang terakhir menang. Tanpa twMerge, menulis
 * `cn("p-4", "p-8")` menghasilkan kedua kelas ikut terpasang dan hasilnya
 * bergantung urutan di berkas CSS — bukan urutan yang kamu tulis.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
