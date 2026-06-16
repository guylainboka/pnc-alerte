import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PNC - Centre de Commandement | Police Nationale Congolaise",
  description: "Plateforme de centre de commandement pour la Police Nationale Congolaise. Gestion des alertes, dossiers criminels, plaintes et intégrations.",
  keywords: ["PNC", "Police Nationale Congolaise", "Centre de Commandement", "RDC", "Congo"],
  authors: [{ name: "Police Nationale Congolaise" }],
  icons: {
    icon: "/pnc-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
