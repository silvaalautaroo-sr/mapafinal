import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
