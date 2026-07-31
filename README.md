# Porto — Portofolio Fullstack + Admin Panel

Self-hosted portfolio untuk **porto.chiyu.my.id**.
Next.js 15 (App Router) · PostgreSQL 16 + Prisma · Clerk (admin SSO) · Docker · Cloudflare Tunnel.

---

## Struktur

```
prisma/schema.prisma            model Project + migrasi awal
src/app/page.tsx                Frontend publik — grid proyek (tumbuh otomatis)
src/app/admin/                  Dashboard CRUD (dilindungi Clerk)
src/app/sign-in/                Halaman login Clerk
src/app/api/projects/           GET (publik) · POST/PATCH/DELETE (admin)
src/app/api/uploads/[...path]/  Serve gambar dari volume uploads/
src/app/api/health/             Healthcheck (dipakai docker-compose)
src/lib/                        prisma · auth gate · upload · validasi zod
src/middleware.ts               Clerk middleware, proteksi /admin + mutation API
uploads/                        Gambar proyek (bind mount ke host → gampang backup)
```

**Alur gambar:** upload → disimpan di `UPLOAD_DIR` (`/app/uploads` di container, `./uploads` di host)
dengan nama acak → DB menyimpan URL `/api/uploads/<file>` → route handler menyajikannya dengan
proteksi path-traversal + cache 1 tahun. Ganti/hapus gambar akan menghapus file lama setelah DB commit.

---

## 1. Siapkan Clerk

1. Buat aplikasi di https://dashboard.clerk.com
2. **API Keys** → salin `Publishable key` dan `Secret key`.
3. **Configure → Restrictions → Sign-up mode → Restricted** (penting: cegah orang lain daftar).
   Lalu **Users → Create user** untuk akun admin kamu.
4. **Domains** → tambahkan `porto.chiyu.my.id` (production instance).

Whitelist tambahan di aplikasi: isi `ADMIN_EMAILS` — hanya email tersebut yang boleh
masuk `/admin` dan memanggil API mutation, walaupun punya sesi Clerk yang valid.

## 2. Siapkan Cloudflare Tunnel

1. `dash.cloudflare.com` → **Zero Trust → Networks → Tunnels → Create a tunnel** → tipe **Cloudflared**.
2. Salin **token**-nya → isi `CLOUDFLARE_TUNNEL_TOKEN` di `.env`.
3. Tab **Public Hostname** → tambahkan:
   - Subdomain: `porto` · Domain: `chiyu.my.id`
   - Service: `HTTP` → `app:3000` ← *nama service compose, bukan localhost*
4. Additional settings → **HTTP Host Header**: `porto.chiyu.my.id` (opsional tapi disarankan).

DNS record dibuat otomatis oleh Cloudflare. Tidak perlu buka port apa pun di router T480.

## 3. Deploy di T480 (Ubuntu)

```bash
# prasyarat sekali saja
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER && newgrp docker

# ambil kode
git clone <repo-kamu> porto && cd porto

# konfigurasi
cp .env.example .env
nano .env          # isi POSTGRES_PASSWORD, DATABASE_URL, kunci Clerk, ADMIN_EMAILS, token tunnel

# folder upload (container jalan sebagai uid 1000, sama dengan user `alex`)
mkdir -p uploads

# build + jalankan
docker compose up -d --build
docker compose logs -f app
```

Entrypoint container akan menunggu Postgres siap lalu menjalankan `prisma migrate deploy`
otomatis — tidak ada langkah migrasi manual.

Cek: `curl -s localhost:3000/api/health` tidak akan jalan karena port sengaja tidak di-publish.
Gunakan `docker compose exec app node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>r.text()).then(console.log)"`
atau langsung buka https://porto.chiyu.my.id.

### Update setelah ganti kode

```bash
git pull
docker compose up -d --build app
```

### Catatan penting

- **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` di-inline saat build.** Kalau kunci Clerk berubah,
  wajib `docker compose build --no-cache app`, bukan sekadar restart.
- Port Postgres **tidak** di-publish ke host — hanya network internal `porto`.
- Port app **tidak** di-publish — semua trafik lewat Cloudflare Tunnel.
  Untuk debug lokal, buka comment blok `ports:` di service `app`.

---

## 4. Backup

**Database** (named volume `porto_pgdata`):

```bash
docker compose exec -T db pg_dump -U porto porto | gzip > backup-db-$(date +%F).sql.gz

# restore
gunzip -c backup-db-2026-07-31.sql.gz | docker compose exec -T db psql -U porto -d porto
```

**Gambar** — folder `./uploads` di host, tinggal masukkan ke rsync/borg biasa:

```bash
tar czf backup-uploads-$(date +%F).tar.gz uploads/
```

Cron harian:

```cron
0 3 * * * cd /home/USER/porto && docker compose exec -T db pg_dump -U porto porto | gzip > /backup/porto-db-$(date +\%F).sql.gz
15 3 * * * tar czf /backup/porto-uploads-$(date +\%F).tar.gz -C /home/USER/porto uploads
```

---

## 5. Pengembangan lokal (opsional)

Butuh Postgres yang jalan. Cara tercepat:

```bash
docker compose up -d db          # hanya database
# ubah DATABASE_URL di .env → host "localhost", dan publish port db dulu di compose
npx prisma migrate deploy
npm run dev
```

---

## Environment variables

| Variable | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | ya | host `db` untuk compose |
| `POSTGRES_USER` / `_PASSWORD` / `_DB` | ya | dipakai container Postgres |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ya | build-time **dan** runtime |
| `CLERK_SECRET_KEY` | ya | runtime saja |
| `ADMIN_EMAILS` | disarankan | whitelist admin, dipisah koma; kosong = semua user Clerk |
| `NEXT_PUBLIC_SITE_URL` | ya | `https://porto.chiyu.my.id` (metadata/OG) |
| `UPLOAD_DIR` | — | default `/app/uploads` |
| `CLOUDFLARE_TUNNEL_TOKEN` | ya | token tunnel |

---

## Keamanan yang sudah diterapkan

- Semua mutation API lewat `requireAdmin()` — cek sesi Clerk **dan** whitelist email, tidak
  bergantung pada middleware saja.
- Validasi input dengan zod (panjang, format URL, jumlah tech stack).
- Upload: whitelist MIME, batas 8 MB, nama file diacak (nama asli user tidak pernah dipakai).
- Serve file: path di-resolve dan diverifikasi masih di dalam `UPLOAD_DIR`; SVG dikirim dengan
  `Content-Security-Policy: default-src 'none'; sandbox` supaya tidak bisa eksekusi script.
- Container berjalan sebagai user non-root (`node`, uid 1000 — sengaja disamakan dengan user
  `alex` di T480 supaya bind mount `uploads/` writable tanpa root).
- Postgres tidak terekspos ke jaringan host maupun internet.
