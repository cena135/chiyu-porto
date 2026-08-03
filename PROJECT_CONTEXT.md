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
│   ├── seed.mjs                             <- seeder dummy: 6 proyek + SVG screenshot
│   ├── schema.prisma                        <- model `Project` + `ProjectImage`
│   └── migrations/20260731000000_init/       <- migrasi awal, sudah di-generate
│
├── src/app/
│   ├── layout.tsx                            <- ClerkProvider + font Inter/Outfit + aurora bg
│   ├── globals.css                           <- SELURUH desain: palet oklch, .glass,
│   │                                            .card-hover, .btn-glow, .reveal, aurora-field
│   ├── page.tsx                              <- FRONTEND PUBLIK. Grid proyek auto-grow.
│   │                                            revalidate = 60 detik.
│   ├── p/[slug]/page.tsx                     <- HALAMAN DETAIL PROYEK (SSG + ISR 60s)
│   ├── not-found.tsx                         <- 404 bergaya premium
│   ├── sign-in/[[...sign-in]]/page.tsx       <- halaman login Clerk
│   ├── admin/
│   │   ├── page.tsx                          <- server component, gate requireAdmin()
│   │   ├── AdminDashboard.tsx                <- CLIENT. Shell: tab, statistik, cari/filter, daftar
│   │   ├── ProjectForm.tsx                   <- CLIENT. Form tambah/ubah + galeri (batch)
│   │   └── GalleryManager.tsx                <- CLIENT. Modal kelola screenshot, simpan langsung
│   └── api/
│       ├── projects/route.ts                 <- GET (publik) · POST (admin, multipart)
│       ├── projects/[id]/route.ts            <- GET · PATCH · DELETE (admin)
│       ├── projects/[id]/images/route.ts     <- POST tambah · DELETE hapus · PATCH urutkan galeri
│       ├── projects/[id]/status/route.ts     <- PATCH toggle cepat published/featured
│       ├── uploads/[...path]/route.ts        <- serve gambar dari UPLOAD_DIR, anti traversal
│       └── health/route.ts                   <- dipakai healthcheck docker-compose
│
├── src/components/ProjectCard.tsx            <- kartu proyek, stretched link ke /p/[slug]
├── src/components/ProjectGallery.tsx         <- galeri halaman detail (cover besar + grid)
├── src/components/Lightbox.tsx               <- viewer galeri (panah, Esc, thumbnail strip)
├── src/lib/useInView.ts                      <- hook IntersectionObserver, sekali picu
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
│                                                Tidak perlu chown: container jalan uid 1000,
│                                                sama dengan user `alex` di T480.
│
├── Dockerfile                                <- 3 stage (deps/builder/runner), output standalone,
│                                                user non-root `node` uid 1000 (samain dgn alex)
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
6. **Animasi masuk dipasang di WRAPPER `.slide-in`, bukan di `.card-hover`.** `.card-hover`
   memakai `transform` untuk efek angkat; kalau animasi bertumpuk di elemen yang sama,
   `animation-fill-mode: both` mengunci transform dan hover-nya mati. Jangan digabung.
7. **Stagger animasi pakai `index % 3`, bukan index global.** Kalau global, kartu di baris
   ke-10 harus menunggu antrean 10 x delay saat baru di-scroll ke sana.
8. **Migrasi TIDAK jalan di entrypoint app.** Itu tugas service `migrate` (stage builder).
   Runner sengaja cuma bawa query engine — memetik sebagian `node_modules` bikin CLI Prisma
   kehilangan dependensi transitif dan container restart terus.

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

**STATUS: SUDAH LIVE di https://porto.chiyu.my.id (31 Jul 2026)** — HTTP 200 via Cloudflare Tunnel.
Container: `porto-app` (healthy), `porto-db` (healthy), `porto-migrate` (Exited 0 = sukses),
`porto-tunnel` (up). Migrasi `init` + `project_images` sudah diterapkan.

**Sudah jadi:**
- [x] Schema DB + migrasi awal
- [x] Frontend publik, grid auto-grow, desain glassmorphism premium
- [x] Admin CRUD penuh (Clerk-protected)
- [x] Upload gambar lokal ke `uploads/`
- [x] Dockerfile + docker-compose (app/db/cloudflared) + entrypoint auto-migrate
- [x] Build produksi terverifikasi hijau di lokal
- [x] Push ke GitHub
- [x] Galeri multi-gambar per proyek (tabel `ProjectImage`, lightbox, manajer urutan/cover)
- [x] Deploy perdana ke T480 — verified end-to-end (tabel DB, health, tulis uploads, domain publik)
- [x] Animasi grid slide-in kanan→kiri saat masuk viewport (2 Agu 2026) — diverifikasi di
      produksi dengan 4 kartu uji: stagger 0/90/180/0ms benar, CSS terkirim, data uji sudah dihapus
- [x] Smooth scroll tombol "Lihat Karya" → `#karya`. CSS-native (`scroll-behavior: smooth` +
      `scroll-padding-top: 5rem` di `html`), nol JS. Dimatikan otomatis saat
      `prefers-reduced-motion`. JANGAN tambah `scroll-mt-*` di section target — offset jadi dobel.

- [x] Admin Dashboard lengkap (2 Agu 2026): tab Daftar/Tambah, statistik, pencarian, filter
      status, urutan, toggle terbitkan/unggulan instan, modal Kelola Gambar, seeder dummy
- [x] Seeder `prisma/seed.mjs` — dijalankan di server:
      `docker compose exec app node prisma/seed.mjs` (`--reset` hapus, `--force` timpa)

- [x] Halaman detail `/p/[slug]` (2 Agu 2026). Kartu beranda kini menuju halaman ini, bukan
      lightbox. Diverifikasi live: 3 slug → 200, draf → 404, slug ngawur → 404.

- [x] Sistem gerak disatukan (3 Agu 2026). Token easing/durasi di `@theme`, modal & fokus
      diperhalus. Diverifikasi di CSS produksi.

**SISTEM GERAK — PAKAI TOKEN, JANGAN TULIS ANGKA MENTAH:**
Semua di `src/app/globals.css` blok `@theme`:
- Durasi: `--dur-fast 180ms` · `--dur-base 300ms` · `--dur-slow 460ms` · `--dur-entrance 700ms`
- Easing: `--ease-out-quart` (UI umum) · `--ease-out-expo` (animasi masuk) · `--ease-spring` (modal)
- `--default-transition-duration` & `--default-transition-timing-function` di-override, jadi
  SEMUA utilitas `transition-*` Tailwind ikut (default aslinya cuma 150ms dan terasa patah).
  Artinya: **tidak perlu menulis `duration-*` di tiap elemen.**
- Kelas siap pakai: `.reveal` `.slide-in` `.fade-up` `.pop-in` `.modal-backdrop` `.modal-panel`
  `.media-swap`

**JEBAKAN TAMBAHAN (jangan diulang):**
9. **Kartu memakai pola stretched link**, bukan `<a>` yang membungkus seluruh kartu — anchor
   bersarang itu HTML tidak sah dan bikin tautan Live/Source tidak bisa diklik. Overlay
   `<Link className="absolute inset-0 z-0">`, isi teks `pointer-events-none`, tautan keluar
   `pointer-events-auto z-10`.
10. **Mutasi admin wajib memanggil `revalidatePublic()`** (`src/lib/projects.ts`), bukan
   `revalidatePath("/")` saja — kalau tidak, `/p/[slug]` menyajikan data basi sampai 60 detik.

**KEPUTUSAN: `featured` & `published` TIDAK DIHAPUS.**
CEO minta evaluasi "hapus jika tidak ada fungsinya". Hasil evaluasi: keduanya berfungsi nyata.
`published` menggerakkan fitur draf (`page.tsx` filter `where: { published: true }`),
`featured` menentukan urutan tampil + badge di kartu. Sudah dibuktikan di produksi: proyek draf
"Kanvas Piksel Kolaboratif" tidak muncul di halaman publik. Menghapusnya butuh `DROP COLUMN`
(dilarang SOP tanpa izin eksplisit). Yang diperbaiki: kejelasan UI-nya.

**PR/UTANG YANG MASIH MENGGANTUNG (WAJIB DIBACA AGEN BERIKUTNYA):**
- [ ] **`ADMIN_EMAILS` di `.env` server masih `you@example.com`** → CEO belum bisa masuk `/admin`.
      Variabel runtime: cukup edit `.env` lalu `docker compose up -d app`. TIDAK perlu rebuild.
- [ ] **Kunci Clerk masih `pk_test`/`sk_test` (development instance)** di domain produksi.
      Efeknya: `/admin` butuh handshake dev-browser (curl dapat 404, browser asli masih jalan),
      ada banner dev, dan batas user rendah. Ganti ke `pk_live`/`sk_live` dari Clerk
      **production instance**. `NEXT_PUBLIC_*` ter-inline saat build →
      WAJIB `docker compose build --no-cache app` setelah ganti.

**Belum / berikutnya:**
- [ ] Pasang cron backup ke `/mnt/backup` (tiru pola `/home/alex/chiyupals/backup.sh`)
- [ ] Halaman detail proyek `/p/[slug]` (slug sudah ada di DB, belum ada halamannya)
- [ ] Kompres gambar otomatis (sharp → webp) biar hemat disk T480
- [ ] Sitemap dinamis (robots.txt sudah nunjuk ke `/sitemap.xml`, file-nya belum ada)
