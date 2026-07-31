import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseProjectForm, uniqueSlug } from "@/lib/projects";
import { deleteUpload, saveUpload } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project });
}

/** Admin: update proyek. Gambar lama dihapus hanya kalau ada gambar baru / dihapus eksplisit. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();
  const parsed = parseProjectForm(form);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  let imageUrl = existing.imageUrl;
  let staleImage: string | null = null;

  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    const saved = await saveUpload(file);
    if (!saved.ok) return NextResponse.json({ error: saved.error }, { status: 400 });
    staleImage = existing.imageUrl;
    imageUrl = saved.url;
  } else if (form.get("removeImage") === "true") {
    staleImage = existing.imageUrl;
    imageUrl = null;
  }

  const data = parsed.data;
  const project = await prisma.project.update({
    where: { id },
    data: {
      title: data.title,
      slug:
        data.title === existing.title ? existing.slug : await uniqueSlug(data.title, existing.id),
      description: data.description,
      content: data.content || null,
      liveUrl: data.liveUrl || null,
      repoUrl: data.repoUrl || null,
      techStack: data.techStack,
      featured: data.featured,
      published: data.published,
      order: data.order,
      imageUrl,
    },
  });

  // Baru hapus file lama setelah DB commit sukses.
  await deleteUpload(staleImage);

  revalidatePath("/");
  return NextResponse.json({ project });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.project.delete({ where: { id } });
  await deleteUpload(existing.imageUrl);

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
