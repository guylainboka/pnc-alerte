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
};

export default nextConfig;
