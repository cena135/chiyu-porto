import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PROJECT_ORDER, WITH_IMAGES, parseProjectForm, revalidatePublic, uniqueSlug } from "@/lib/projects";
import { MAX_GALLERY, saveUploads } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Publik: daftar proyek yang published, lengkap dengan galeri. */
export async function GET() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: PROJECT_ORDER,
    include: WITH_IMAGES,
  });
  return NextResponse.json({ projects });
}

/** Admin: buat proyek baru (multipart/form-data, field `images` boleh banyak). */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  const form = await req.formData();
  const parsed = parseProjectForm(form);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_GALLERY) {
    return NextResponse.json({ error: `Maksimal ${MAX_GALLERY} gambar per proyek.` }, { status: 400 });
  }

  const uploaded = await saveUploads(files);
  if (!uploaded.ok) return NextResponse.json({ error: uploaded.error }, { status: 400 });

  const data = parsed.data;
  const project = await prisma.project.create({
    data: {
      title: data.title,
      slug: await uniqueSlug(data.title),
      description: data.description,
      content: data.content || null,
      liveUrl: data.liveUrl || null,
      repoUrl: data.repoUrl || null,
      techStack: data.techStack,
      featured: data.featured,
      published: data.published,
      order: data.order,
      images: {
        create: uploaded.urls.map((url, i) => ({ url, order: i })),
      },
    },
    include: WITH_IMAGES,
  });

  revalidatePublic();
  return NextResponse.json({ project }, { status: 201 });
}
