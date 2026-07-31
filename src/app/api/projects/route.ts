import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseProjectForm, uniqueSlug } from "@/lib/projects";
import { saveUpload } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Publik: daftar proyek yang published. */
export async function GET() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ projects });
}

/** Admin: buat proyek baru (multipart/form-data). */
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

  let imageUrl: string | null = null;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    const saved = await saveUpload(file);
    if (!saved.ok) return NextResponse.json({ error: saved.error }, { status: 400 });
    imageUrl = saved.url;
  }

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
      imageUrl,
    },
  });

  revalidatePath("/");
  return NextResponse.json({ project }, { status: 201 });
}
