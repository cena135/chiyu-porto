import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { WITH_IMAGES } from "@/lib/projects";
import { MAX_GALLERY, deleteUpload, saveUploads } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function guard(id: string) {
  const gate = await requireAdmin();
  if (!gate.ok) return { err: NextResponse.json({ error: gate.message }, { status: gate.status }) };

  const project = await prisma.project.findUnique({ where: { id }, include: WITH_IMAGES });
  if (!project) return { err: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  return { project };
}

/** Tambah gambar ke galeri (multipart, field `images`). */
export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { err, project } = await guard(id);
  if (err) return err;

  const form = await req.formData();
  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return NextResponse.json({ error: "Tidak ada file." }, { status: 400 });

  if (project.images.length + files.length > MAX_GALLERY) {
    const sisa = MAX_GALLERY - project.images.length;
    return NextResponse.json(
      { error: `Galeri penuh. Sisa kuota ${sisa} gambar (batas ${MAX_GALLERY}).` },
      { status: 400 },
    );
  }

  const uploaded = await saveUploads(files);
  if (!uploaded.ok) return NextResponse.json({ error: uploaded.error }, { status: 400 });

  try {
    await prisma.projectImage.createMany({
      data: uploaded.urls.map((url, i) => ({
        projectId: id,
        url,
        order: project.images.length + i,
      })),
    });
  } catch (e) {
    await Promise.all(uploaded.urls.map(deleteUpload));
    throw e;
  }

  const fresh = await prisma.project.findUnique({ where: { id }, include: WITH_IMAGES });
  revalidatePath("/");
  return NextResponse.json({ project: fresh }, { status: 201 });
}

/** Hapus sebagian gambar. Body JSON: { ids: string[] } */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { err, project } = await guard(id);
  if (err) return err;

  const body = await req.json().catch(() => ({}));
  const own = new Set(project.images.map((i) => i.id));
  const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((i: string) => own.has(i)) : [];
  if (ids.length === 0) return NextResponse.json({ error: "Tidak ada gambar dipilih." }, { status: 400 });

  await prisma.projectImage.deleteMany({ where: { projectId: id, id: { in: ids } } });

  // Rapatkan urutan supaya tidak berlubang setelah penghapusan.
  const sisa = project.images.filter((i) => !ids.includes(i.id));
  await prisma.$transaction(
    sisa.map((img, n) => prisma.projectImage.update({ where: { id: img.id }, data: { order: n } })),
  );

  await Promise.all(
    project.images.filter((i) => ids.includes(i.id)).map((i) => deleteUpload(i.url)),
  );

  const fresh = await prisma.project.findUnique({ where: { id }, include: WITH_IMAGES });
  revalidatePath("/");
  return NextResponse.json({ project: fresh });
}

/** Ubah urutan galeri. Body JSON: { order: string[] } — indeks 0 jadi cover. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { err, project } = await guard(id);
  if (err) return err;

  const body = await req.json().catch(() => ({}));
  const own = new Set(project.images.map((i) => i.id));
  const order: string[] = Array.isArray(body.order)
    ? body.order.filter((i: string) => own.has(i))
    : [];
  if (order.length === 0) return NextResponse.json({ error: "Urutan kosong." }, { status: 400 });

  // Gambar yang tidak disebut ditaruh di belakang, urutan aslinya dipertahankan.
  const rest = project.images.filter((i) => !order.includes(i.id)).map((i) => i.id);
  const final = [...order, ...rest];

  await prisma.$transaction(
    final.map((imgId, n) => prisma.projectImage.update({ where: { id: imgId }, data: { order: n } })),
  );

  const fresh = await prisma.project.findUnique({ where: { id }, include: WITH_IMAGES });
  revalidatePath("/");
  return NextResponse.json({ project: fresh });
}
