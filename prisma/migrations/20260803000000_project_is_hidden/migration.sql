-- AlterTable
ALTER TABLE "Project" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- Halaman publik menyaring published = true DAN isHidden = false.
-- Indeks lama hanya mencakup (published, order), jadi ditambah yang sesuai.
CREATE INDEX "Project_published_isHidden_order_idx" ON "Project"("published", "isHidden", "order");
