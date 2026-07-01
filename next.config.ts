import type { NextConfig } from "next";

const isCapacitor = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  // Pour Capacitor Android, on utilise l'export statique
  // Pour le web, on garde standalone
  output: isCapacitor ? "export" : "standalone",
  images: {
    unoptimized: isCapacitor ? true : false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Autoriser les requêtes cross-origin depuis le preview Z.ai
  allowedDevOrigins: [
    '.space-z.ai',
  ],
};

export default nextConfig;
