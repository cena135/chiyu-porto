import type { Metadata } from "next";
import { Chakra_Petch, Inter, Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SmoothScrolling } from "@/components/SmoothScrolling";
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

// Font judul tema Bento. Chakra Petch wajib menyebutkan weight karena bukan
// variable font — tanpa itu next/font menolak memuatnya.
const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-chakra",
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
    <ClerkProvider appearance={{ variables: { colorPrimary: "#2563eb" } }}>
      <html
        lang="id"
        className={`${inter.variable} ${outfit.variable} ${chakra.variable}`}
      >
        <body>
          <SmoothScrolling>{children}</SmoothScrolling>
        </body>
      </html>
    </ClerkProvider>
  );
}
