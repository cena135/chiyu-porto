import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { WITH_IMAGES } from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).max(9999).optional(),
});

/**
 * Toggle cepat dari daftar admin — tidak perlu membuka form penuh.
 * Body JSON: { published?, featured?, order? }
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan." }, { status: 400 });
  }

  const exists = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const project = await prisma.project.update({
    where: { id },
    data: parsed.data,
    include: WITH_IMAGES,
  });

  revalidatePath("/");
  return NextResponse.json({ project });
}
