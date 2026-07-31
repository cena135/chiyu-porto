-- CreateTable
CREATE TABLE "ProjectImage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectImage_projectId_order_idx" ON "ProjectImage"("projectId", "order");

-- AddForeignKey
ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Pindahkan gambar tunggal lama menjadi item galeri pertama (order 0).
INSERT INTO "ProjectImage" ("id", "projectId", "url", "order", "createdAt")
SELECT md5(random()::text || clock_timestamp()::text), "id", "imageUrl", 0, CURRENT_TIMESTAMP
FROM "Project"
WHERE "imageUrl" IS NOT NULL AND "imageUrl" <> '';

-- DropColumn
ALTER TABLE "Project" DROP COLUMN "imageUrl";
