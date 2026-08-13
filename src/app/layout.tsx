import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { CursorProvider } from "@/components/ui/cursor-store";
import { CustomCursor } from "@/components/ui/CustomCursor";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://porto.chiyu.my.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Portofolio — Chiyu", template: "%s · Portofolio" },
  description: "Kumpulan proyek, eksperimen, dan produk yang saya bangun.",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Portofolio — Chiyu",
    description: "Kumpulan proyek, eksperimen, dan produk yang saya bangun.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ variables: { colorPrimary: "#ffffff" } }}>
      <html lang="id" className={`${inter.variable} ${outfit.variable}`}>
        <body>
          {/* Aurora ambient global — dipasang di layout, bukan page, supaya
              halaman detail proyek dan panel admin ikut mendapat cahayanya.
              Dua noda cahayanya adalah ::before/::after milik div ini. */}
          <div className="aurora-field" aria-hidden />
          {/* Provider hanya menyimpan VARIAN kursor. Posisinya ditangani
              motion value di dalam CustomCursor, tidak lewat React state. */}
          <CursorProvider>
            <CustomCursor />
            {children}
          </CursorProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
