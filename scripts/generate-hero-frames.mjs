/**
 * Membuat frame DUMMY untuk sequence hero: bola kawat 3D yang berputar.
 *
 *   node scripts/generate-hero-frames.mjs
 *
 * Hasilnya: public/hero-frames/frame-001.svg ... frame-036.svg (~830 KB total)
 *
 * KENAPA SVG, bukan JPG/PNG:
 * generator ini tidak memakai pustaka gambar apa pun — cukup Node polos, jadi
 * tidak menambah dependensi. Tiap frame ~23 KB dan digambar ke canvas lewat
 * drawImage seperti bitmap biasa.
 *
 * MENGGANTI DENGAN ASET ASLI:
 * timpa isi public/hero-frames/ dengan render sendiri, lalu sesuaikan `frames`
 * dan `ext` pada <HeroSequence /> di src/app/page.tsx. Untuk aset asli sebaiknya
 * pakai JPG/WebP dengan lebar 1400-1600px; SVG di sini hanya karena dummy.
 */
import { mkdir, writeFile, readdir, unlink } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "hero-frames");
const FRAMES = 36;
const W = 1200;
const H = 1200;

// Palet mengikuti tema editorial situs (aurora · violet · ember).
const AURORA = "#5fd3e0";
const VIOLET = "#a78bfa";

const MERIDIAN = 12; // garis bujur
const PARALLEL = 7; // garis lintang
const SEG = 40; // kehalusan tiap garis
const CHUNK = 8; // tiap garis dipecah jadi 8 ruas untuk isyarat kedalaman

const TILT = (-18 * Math.PI) / 180;

/** Proyeksi ortografis sederhana + sedikit perspektif supaya terasa berisi. */
function project(x, y, z) {
  // miringkan sumbu X
  const y1 = y * Math.cos(TILT) - z * Math.sin(TILT);
  const z1 = y * Math.sin(TILT) + z * Math.cos(TILT);
  const persp = 1 + z1 * 0.16; // titik jauh sedikit mengecil
  return {
    x: W / 2 + x * 420 * persp,
    y: H / 2 + y1 * 420 * persp,
    z: z1,
  };
}

function rotY(x, y, z, a) {
  return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
}

/**
 * Satu garis dipecah jadi beberapa POLYLINE (bukan per ruas <line>).
 *
 * Versi pertama memakai satu <line> per ruas supaya opasitasnya bisa mengikuti
 * kedalaman dengan mulus — hasilnya ~1400 elemen dan 176 KB PER FRAME, total
 * 8,4 MB. Tidak masuk akal untuk di-preload, apalagi di ponsel.
 *
 * Dengan 8 kelompok, isyarat kedalamannya masih terbaca tapi ukurannya turun
 * sekitar sepuluh kali lipat.
 */
function polyline(points, warna) {
  const out = [];
  const per = Math.ceil((points.length - 1) / CHUNK);

  for (let c = 0; c < CHUNK; c++) {
    const mulai = c * per;
    const akhir = Math.min(mulai + per, points.length - 1);
    if (akhir <= mulai) continue;

    const ruas = points.slice(mulai, akhir + 1);
    const zAvg = ruas.reduce((n, p) => n + p.z, 0) / ruas.length;
    const op = (0.07 + ((zAvg + 1) / 2) * 0.83).toFixed(2);
    const w = (0.6 + ((zAvg + 1) / 2) * 1.7).toFixed(1);
    const d = ruas.map((p) => `${Math.round(p.x)},${Math.round(p.y)}`).join(" ");

    out.push(
      `<polyline points="${d}" fill="none" stroke="${warna}" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round"/>`,
    );
  }
  return out.join("");
}

function frameSvg(t) {
  const putar = t * Math.PI * 2; // satu putaran penuh sepanjang sequence
  const bagian = [];

  // Garis bujur
  for (let m = 0; m < MERIDIAN; m++) {
    const lon = (m / MERIDIAN) * Math.PI * 2;
    const pts = [];
    for (let s = 0; s <= SEG; s++) {
      const lat = -Math.PI / 2 + (s / SEG) * Math.PI;
      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lon);
      const [rx, ry, rz] = rotY(x, y, z, putar);
      pts.push(project(rx, ry, rz));
    }
    bagian.push(polyline(pts, m % 3 === 0 ? VIOLET : AURORA));
  }

  // Garis lintang
  for (let p = 1; p < PARALLEL; p++) {
    const lat = -Math.PI / 2 + (p / PARALLEL) * Math.PI;
    const pts = [];
    for (let s = 0; s <= SEG; s++) {
      const lon = (s / SEG) * Math.PI * 2;
      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lon);
      const [rx, ry, rz] = rotY(x, y, z, putar);
      pts.push(project(rx, ry, rz));
    }
    bagian.push(polyline(pts, AURORA));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><radialGradient id="g" cx="42%" cy="34%" r="62%">
<stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.20"/>
<stop offset="60%" stop-color="${AURORA}" stop-opacity="0.06"/>
<stop offset="100%" stop-color="#000" stop-opacity="0"/>
</radialGradient></defs>
<circle cx="${W / 2}" cy="${H / 2}" r="430" fill="url(#g)"/>
${bagian.join("\n")}
</svg>`;
}

async function main() {
  await mkdir(OUT, { recursive: true });

  // Bersihkan frame lama supaya jumlahnya tidak campur saat FRAMES diubah.
  for (const f of await readdir(OUT).catch(() => [])) {
    if (/^frame-\d+\.svg$/.test(f)) await unlink(path.join(OUT, f));
  }

  let total = 0;
  for (let i = 0; i < FRAMES; i++) {
    const nama = `frame-${String(i + 1).padStart(3, "0")}.svg`;
    const isi = frameSvg(i / FRAMES);
    await writeFile(path.join(OUT, nama), isi, "utf8");
    total += Buffer.byteLength(isi);
  }

  console.log(`[frames] ${FRAMES} frame dibuat di public/hero-frames/`);
  console.log(`[frames] total ${(total / 1024).toFixed(0)} KB (~${(total / FRAMES / 1024).toFixed(1)} KB/frame)`);
}

main().catch((e) => {
  console.error("[frames] GAGAL:", e);
  process.exitCode = 1;
});
