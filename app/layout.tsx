import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import GlassFilters from "@/components/GlassFilters";
import ChromaReveal from "@/components/ChromaReveal";
import EdgeBlur from "@/components/EdgeBlur";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ЕХО — види како изгледа денешниот ден",
  description:
    "Анонимен визуелен дневник. Запиши како се чувствуваш денес, добиј единствен емоционален отпечаток и почувствувај дека не си сам.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mk" className={manrope.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="aurora" aria-hidden="true" />
        <GlassFilters />
        <ChromaReveal />
        {children}
        <EdgeBlur />
        <div className="screen-aberration" aria-hidden="true" />
      </body>
    </html>
  );
}
