import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootClientProvider from "@/components/providers/root-client-provider";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dashboard Pengelolaan Aset Digital",
  description: "Platform terpusat untuk mengelola domain, hosting, VPS, dan website perusahaan",
};

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <RootClientProvider>
          {children}
          <Analytics />
        </RootClientProvider>
      </body>
    </html>
  );
}
