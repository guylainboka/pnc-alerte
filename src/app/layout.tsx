import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PNC Alerte — Police Nationale Congolaise",
  description: "Application officielle de la Police Nationale Congolaise. Signalez des incidents, recevez des alertes de sécurité, déposez des plaintes et accédez aux services numériques de la PNC.",
  keywords: ["PNC", "RDC", "Police", "Alerte", "Sécurité", "Kinshasa", "Congo"],
  authors: [{ name: "Police Nationale Congolaise" }],
  icons: {
    icon: "/logo.jpeg",
  },
  openGraph: {
    title: "PNC Alerte",
    description: "Sécurité au bout des doigts — Police Nationale Congolaise",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B2D6B",
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
        <Toaster />
      </body>
    </html>
  );
}
