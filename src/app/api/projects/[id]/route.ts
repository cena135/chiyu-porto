import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  PUBLIC_WHERE,
  WITH_IMAGES,
  parseProjectForm,
  revalidatePublic,
  uniqueSlug,
} from "@/lib/projects";
import { MAX_GALLERY, deleteUpload, saveUploads } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Ambil satu proyek.
 *
 * KERENTANAN YANG DITAMBAL: dulu handler ini tidak memeriksa apa pun, dan
 * middleware sengaja membebaskan semua GET di /api/projects. Akibatnya siapa pun
 * tanpa login bisa membaca proyek DRAF maupun yang di-`isHidden` (internal/NDA)
 * secara utuh — cukup tahu id-nya. Terbukti mengembalikan 200 saat diuji.
 *
 * Sekarang: admin boleh membaca apa pun; publik hanya boleh membaca proyek yang
 * memang layak tampil. Selain itu dijawab 404 — bukan 403 — supaya tidak
 * membocorkan bahwa id tersebut ada.
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const gate = await requireAdmin();

  const project = await prisma.project.findFirst({
    where: gate.ok ? { id } : { id, ...PUBLIC_WHERE },
    include: WITH_IMAGES,
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project });
}

/**
 * Admin: update proyek + galeri.
 * Field galeri yang dikenali:
 *   images          — file baru (boleh banyak), ditambahkan ke belakang
 *   deleteImageIds  — id gambar lama yang dihapus (dipisah koma)
 *   imageOrder      — id gambar lama sesuai urutan baru (dipisah koma); yang pertama jadi cover
 */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id }, include: WITH_IMAGES });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();
  const parsed = parseProjectForm(form);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const csv = (key: string) =>
    String(form.get(key) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const ownIds = new Set(existing.images.map((img) => img.id));
  // Hanya terima id yang memang milik proyek ini.
  const deleteIds = csv("deleteImageIds").filter((i) => ownIds.has(i));
  const deleteSet = new Set(deleteIds);

  const kept = csv("imageOrder").filter((i) => ownIds.has(i) && !deleteSet.has(i));
  // Gambar lama yang tidak disebut di imageOrder tetap dipertahankan di urutan aslinya.
  const missing = existing.images
    .filter((img) => !deleteSet.has(img.id) && !kept.includes(img.id))
    .map((img) => img.id);
  const finalOrder = [...kept, ...missing];

  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (finalOrder.length + files.length > MAX_GALLERY) {
    return NextResponse.json(
      { error: `Maksimal ${MAX_GALLERY} gambar per proyek.` },
      { status: 400 },
    );
  }

  const uploaded = await saveUploads(files);
  if (!uploaded.ok) return NextResponse.json({ error: uploaded.error }, { status: 400 });

  const data = parsed.data;

  try {
    await prisma.$transaction([
      prisma.projectImage.deleteMany({ where: { projectId: id, id: { in: deleteIds } } }),
      ...finalOrder.map((imgId, i) =>
        prisma.projectImage.update({ where: { id: imgId }, data: { order: i } }),
      ),
      prisma.projectImage.createMany({
        data: uploaded.urls.map((url, i) => ({
          projectId: id,
          url,
          order: finalOrder.length + i,
        })),
      }),
      prisma.project.update({
        where: { id },
        data: {
          title: data.title,
          /**
           * Slug mengikuti apa yang dikirim form. Form selalu mengirimkan slug
           * yang sedang tampil, jadi slug proyek lama TIDAK berubah diam-diam
           * hanya karena judulnya disunting — URL yang sudah beredar tetap aman.
           * Kalau field-nya dikosongkan, barulah diturunkan ulang dari judul.
           */
          slug: await uniqueSlug(data.slug?.trim() || data.title, existing.id),
          description: data.description,
          content: data.content || null,
          liveUrl: data.liveUrl || null,
          repoUrl: data.repoUrl || null,
          techStack: data.techStack,
          featured: data.featured,
          published: data.published,
          isHidden: data.isHidden,
          isWip: data.isWip,
          order: data.order,
        },
      }),
    ]);
  } catch (err) {
    // DB gagal -> buang file yang baru saja tersimpan supaya tidak jadi sampah.
    await Promise.all(uploaded.urls.map(deleteUpload));
    throw err;
  }

  // Baru hapus file fisik setelah DB commit sukses.
  await Promise.all(
    existing.images.filter((img) => deleteSet.has(img.id)).map((img) => deleteUpload(img.url)),
  );

  const project = await prisma.project.findUnique({ where: { id }, include: WITH_IMAGES });
  revalidatePublic();
  return NextResponse.json({ project });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id }, include: WITH_IMAGES });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Baris ProjectImage ikut terhapus lewat onDelete: Cascade.
  await prisma.project.delete({ where: { id } });
  await Promise.all(existing.images.map((img) => deleteUpload(img.url)));

  revalidatePublic();
  return NextResponse.json({ ok: true });
}
