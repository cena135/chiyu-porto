import avatar from "../../public/avatar.jpg";

/**
 * Satu-satunya sumber untuk identitas CEO.
 *
 * Sebelum ini, foto dan bio ditulis ulang di dalam komponen Bento sementara
 * kontak ditulis ulang lagi di komponen lain. Begitu ada sembilan tema, pola
 * itu berarti sembilan salinan yang bisa berbeda diam-diam — satu nomor
 * WhatsApp diperbarui di satu tema dan tertinggal di delapan lainnya.
 *
 * Ditulis sebagai data biasa (bukan JSX) supaya bisa diambil sekali di Server
 * Component lalu dioper sebagai prop ke seluruh tema.
 */

export const PROFIL = {
  nama: "Alexander Imanuel Joedo",
  avatar,
  status: "Lagi terima proyek baru",
  judul: ["I Build", "and Host", "Websites."],
  /* Ditulis sebagai string, bukan teks JSX langsung: apostrof pada "you're"
     akan diprotes aturan lint react/no-unescaped-entities. */
  bio: "Hai, aku Alexander Imanuel Joedo (22 tahun), Fullstack developer asal Petra angkatan 22, anak kedua dari dua bersaudara. Aku suka belajar, ngoprek, dan bermain dengan teknologi. If you're interested, feel free to contact me :)",
  meta: [
    ["Basis", "Indonesia"],
    ["Fokus", "Web · Infrastruktur"],
    ["Server", "ThinkPad T480, 24/7"],
  ] as [string, string][],
};

export type KontakItem = {
  label: string;
  tampil: string;
  href: string;
  petunjuk: string;
  ikon: "mail" | "instagram" | "whatsapp";
};

export const KONTAK: KontakItem[] = [
  {
    label: "Email",
    tampil: "alexanderjoedo@gmail.com",
    petunjuk: "Buka jendela tulis Gmail",
    // Buka jendela tulis Gmail di web, bukan mailto: — banyak orang tidak punya
    // aplikasi email terpasang, dan mailto pada mereka tidak melakukan apa-apa.
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=alexanderjoedo@gmail.com",
    ikon: "mail",
  },
  {
    label: "Instagram",
    tampil: "@alexander_joedo",
    petunjuk: "Buka profil Instagram",
    href: "https://instagram.com/alexander_joedo",
    ikon: "instagram",
  },
  {
    label: "WhatsApp",
    tampil: "081252729777",
    petunjuk: "Mulai obrolan WhatsApp",
    // Nomor dipakai dalam format internasional (62...) karena wa.me menolak awalan 0.
    href: "https://wa.me/6281252729777?text=Hai%20alex%2C%20aku%20tertarik%20untuk%20diskusi%20projek",
    ikon: "whatsapp",
  },
];

export type Profil = typeof PROFIL;
