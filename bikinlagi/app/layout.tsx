import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootClientProvider from "@/components/providers/root-client-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dashboard Pengelolaan Aset Digital",
  description: "Platform terpusat untuk mengelola domain, hosting, VPS, dan website perusahaan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        <RootClientProvider>
          {children}
        </RootClientProvider>
      </body>
    </html>
  );
}
