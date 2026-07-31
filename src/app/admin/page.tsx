import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PROJECT_ORDER, WITH_IMAGES } from "@/lib/projects";
import { AdminDashboard } from "./AdminDashboard";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const gate = await requireAdmin();

  if (!gate.ok) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <div className="glass max-w-md rounded-3xl p-10 text-center">
          <h1 className="font-display text-xl font-semibold">Akses ditolak</h1>
          <p className="mt-3 text-sm text-mist-400">{gate.message}</p>
          <Link href="/" className="mt-6 inline-block text-sm text-aurora hover:underline">
            ← Kembali ke beranda
          </Link>
        </div>
      </main>
    );
  }

  const projects = await prisma.project.findMany({
    orderBy: PROJECT_ORDER,
    include: WITH_IMAGES,
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-12">
      <header className="reveal glass flex items-center justify-between gap-4 rounded-2xl px-6 py-4">
        <div>
          <h1 className="font-display text-lg font-semibold tracking-tight">Dashboard Proyek</h1>
          <p className="text-xs text-mist-400">{projects.length} proyek tersimpan</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-mist-400 transition-colors hover:text-mist-200">
            Lihat situs ↗
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <AdminDashboard initialProjects={projects} />
    </main>
  );
}
