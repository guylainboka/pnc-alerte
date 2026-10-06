import type { Metadata, Viewport } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Typographie officielle du logiciel : Poppins (identité moderne et lisible).
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Police à chasse fixe conservée pour les données techniques (coordonnées,
// matricules, références de dossiers).
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PNC - Centre de Commandement | Police Nationale Congolaise",
  description: "Plateforme de centre de commandement pour la Police Nationale Congolaise. Gestion des alertes, dossiers criminels, plaintes et intégrations.",
  keywords: ["PNC", "Police Nationale Congolaise", "Centre de Commandement", "RDC", "Congo"],
  authors: [{ name: "Police Nationale Congolaise" }],
  applicationName: "PNC Alerte — Centre de Commandement",
  // Icône du logiciel : dérivée du logo officiel PNC (pnc-logo.png), uniquement
  // redimensionné — le dessin du logo n'est JAMAIS modifié.
  icons: {
    icon: [
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/icon-192.png",
    apple: "/icons/icon-180.png",
  },
};

export const viewport: Viewport = {
  // Vert institutionnel du logo PNC (barre de titre / chrome de l'app installée)
  themeColor: "#1a5d32",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable}`}
    >
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
