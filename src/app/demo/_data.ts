import { prisma } from "@/lib/prisma";
import { PROJECT_ORDER, PUBLIC_WHERE, WITH_IMAGES } from "@/lib/projects";

/**
 * Data proyek untuk halaman demo.
 *
 * Berkas berawalan garis bawah TIDAK dianggap rute oleh App Router, jadi aman
 * diletakkan di dalam folder app/. Query-nya sama persis dengan halaman utama
 * supaya perbandingan A/B menilai TAMPILANNYA saja, bukan isinya.
 */
export async function getDemoProjects() {
  try {
    return await prisma.project.findMany({
      where: PUBLIC_WHERE,
      orderBy: PROJECT_ORDER,
      include: WITH_IMAGES,
    });
  } catch {
    return [];
  }
}
