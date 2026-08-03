import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Gate admin: user harus login Clerk, dan (kalau ADMIN_EMAILS diisi)
 * email-nya harus ada di whitelist. Dipakai di semua mutation route.
 */
export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, status: 401, message: "Unauthorized" };

  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // GAGAL-TERTUTUP. Dulu daftar kosong berarti "semua user Clerk boleh" — satu
  // salah konfigurasi (variabel lupa diisi / typo) langsung memberi hak tulis
  // penuh ke siapa pun yang berhasil mendaftar di instance Clerk. Sekarang
  // ditolak, karena diam-diam terbuka jauh lebih berbahaya daripada terkunci.
  if (allow.length === 0) {
    return {
      ok: false as const,
      status: 403,
      message: "ADMIN_EMAILS belum diisi di server, jadi tidak ada yang berhak masuk admin.",
    };
  }

  const user = await currentUser();
  const emails = (user?.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase());
  if (!emails.some((e) => allow.includes(e))) {
    return { ok: false as const, status: 403, message: "Akun ini tidak terdaftar sebagai admin." };
  }
  return { ok: true as const, userId };
}

export async function isAdmin() {
  return (await requireAdmin()).ok;
}
