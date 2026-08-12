import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter, self-hosted automatically by Next.js — no external <link> needed.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lynx | Intelligent Core",
  description:
    "Visualizacion interactiva del nucleo inteligente Lynx conectando industrias en tiempo real.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-black font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
