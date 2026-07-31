# PROJECT_CONTEXT.md — chiyu-porto

> Baca file ini duluan kalau kamu agen AI baru. Jangan buang token cari file satu-satu.
> Kitab infrastruktur server: `C:\Users\Alexander\Desktop\Server\T480_INFRASTRUCTURE_BIBLE.md`
> dan `AI_MASTER_CONTEXT.md`. Dua file itu HARAM diedit AI.

---

## 1. IDENTITAS PROYEK

| Item | Nilai |
|---|---|
| Nama | chiyu-porto (Portofolio Fullstack + Admin Panel) |
| Repo | https://github.com/cena135/chiyu-porto |
| Domain publik | `porto.chiyu.my.id` |
| Server | T480 Bunker — `alex@100.78.178.15` (Tailscale) |
| Path di server | `/home/alex/chiyu-porto/` |
| Stack | Next.js 15 (App Router) · PostgreSQL 16 + Prisma 6 · Clerk · Tailwind v4 · Docker |

---

## 2. PETA FOLDER (LOKASI SPESIFIK TIAP FITUR)

```
d:\My Projects\Porto\  (lokal)  ==  /home/alex/chiyu-porto/  (server)
│
├── prisma/
│   ├── schema.prisma                        <- model `Project` (satu-satunya tabel)
│   └── migrations/20260731000000_init/       <- migrasi awal, sudah di-generate
│
├── src/app/
│   ├── layout.tsx                            <- ClerkProvider + font Inter/Outfit + aurora bg
│   ├── globals.css                           <- SELURUH desain: palet oklch, .glass,
│   │                                            .card-hover, .btn-glow, .reveal, aurora-field
│   ├── page.tsx                              <- FRONTEND PUBLIK. Grid proyek auto-grow.
│   │                                            revalidate = 60 detik.
│   ├── sign-in/[[...sign-in]]/page.tsx       <- halaman login Clerk
│   ├── admin/
│   │   ├── page.tsx                          <- server component, gate requireAdmin()
│   │   └── AdminDashboard.tsx                <- CLIENT. Form CRUD + list + preview gambar
│   └── api/
│       ├── projects/route.ts                 <- GET (publik) · POST (admin, multipart)
│       ├── projects/[id]/route.ts            <- GET · PATCH · DELETE (admin)
│       ├── uploads/[...path]/route.ts        <- serve gambar dari UPLOAD_DIR, anti traversal
│       └── health/route.ts                   <- dipakai healthcheck docker-compose
│
├── src/components/ProjectCard.tsx            <- kartu proyek di halaman publik
│
├── src/lib/
│   ├── prisma.ts                             <- singleton PrismaClient
│   ├── auth.ts                               <- requireAdmin(): sesi Clerk + whitelist ADMIN_EMAILS
│   ├── upload.ts                             <- saveUpload/deleteUpload, whitelist MIME, maks 8MB
│   └── projects.ts                           <- skema zod, slugify, uniqueSlug, parseProjectForm
│
├── src/middleware.ts                         <- clerkMiddleware. Proteksi /admin + mutation API.
│                                                GET /api/projects sengaja tetap publik.
│
├── uploads/                                  <- GAMBAR PROYEK. Bind mount ke container.
│                                                Wajib `chown -R 1001:1001 uploads` di server.
│
├── Dockerfile                                <- 3 stage (deps/builder/runner), output standalone,
│                                                user non-root uid 1001
├── docker-entrypoint.sh                      <- tunggu Postgres siap -> `prisma migrate deploy` -> start
├── docker-compose.yml                        <- service: db, app, cloudflared
├── .env.example                              <- template. `.env` asli TIDAK di-commit.
└── README.md                                 <- instruksi deploy lengkap + SOP backup
```

---

## 3. KEPUTUSAN ARSITEKTUR (JANGAN DIULANG DEBATNYA)

1. **Gambar pakai bind mount `./uploads`, BUKAN named volume.** Alasan: CEO minta gambar
   gampang di-backup/rsync ke `/mnt/backup`. Named volume nyempil di `/var/lib/docker/volumes`
   dan susah disentuh — masalah yang sama persis dengan `chiyupals` (lihat Bible bab 4).
2. **Database pakai Docker Named Volume `porto_pgdata`** sesuai perintah CEO. Konsekuensi:
   backup DB WAJIB lewat `pg_dump`, bukan copy folder.
3. **Tidak ada `ports:` yang di-publish** untuk app maupun db. Semua trafik lewat Cloudflare
   Tunnel (Bible bab 2). Blok `ports:` untuk debug lokal sudah disiapkan sebagai komentar.
4. **Auth pakai Clerk** (Bible bab 6.1 — jangan bikin hashing sendiri, CPU T480 lemah).
   Lapis kedua: `ADMIN_EMAILS` di `.env`, dicek di `src/lib/auth.ts`.
5. **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` ter-inline saat build image.** Kalau kunci Clerk
   berubah → WAJIB `docker compose build --no-cache app`. Restart doang percuma.

---

## 4. CARA KERJA SERVER (DEPLOY)

Alur baku, semua dikerjakan AI via SSH — CEO tidak menyentuh apa pun:

```bash
# 1. transfer dari Windows -> T480
scp -r ./* alex@100.78.178.15:/home/alex/chiyu-porto/

# 2. build + jalankan
ssh -o BatchMode=yes alex@100.78.178.15 "cd /home/alex/chiyu-porto && docker compose up -d --build"

# 3. cek nyawa
ssh -o BatchMode=yes alex@100.78.178.15 "cd /home/alex/chiyu-porto && docker compose ps"
```

Migrasi Prisma jalan **otomatis** dari `docker-entrypoint.sh`. Tidak ada langkah migrasi manual.

**Cloudflare Tunnel:** Public Hostname `porto.chiyu.my.id` → service `http://app:3000`
(nama service compose, BUKAN localhost).

**Backup** (belum dipasang cron — lihat Roadmap):
- DB: `docker compose exec -T db pg_dump -U porto porto | gzip > ...`
- Gambar: `rsync -a /home/alex/chiyu-porto/uploads/ /mnt/backup/porto_backup/uploads/`

---

## 5. ROADMAP / STATUS

**Sudah jadi:**
- [x] Schema DB + migrasi awal
- [x] Frontend publik, grid auto-grow, desain glassmorphism premium
- [x] Admin CRUD penuh (Clerk-protected)
- [x] Upload gambar lokal ke `uploads/`
- [x] Dockerfile + docker-compose (app/db/cloudflared) + entrypoint auto-migrate
- [x] Build produksi terverifikasi hijau di lokal
- [x] Push ke GitHub

**Belum / berikutnya:**
- [ ] Deploy perdana ke T480 (nunggu CEO isi `.env`)
- [ ] Pasang cron backup ke `/mnt/backup` (tiru pola `/home/alex/chiyupals/backup.sh`)
- [ ] Halaman detail proyek `/p/[slug]` (slug sudah ada di DB, belum ada halamannya)
- [ ] Kompres gambar otomatis (sharp → webp) biar hemat disk T480
- [ ] Sitemap dinamis (robots.txt sudah nunjuk ke `/sitemap.xml`, file-nya belum ada)
