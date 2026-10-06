import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  // Les images sont servies telles quelles (assets locaux PNG) — évite la
  // dépendance au module natif `sharp` dans l'exécutable Windows packagé.
  images: {
    unoptimized: true,
  },
  // Proxy vers le backend NestJS (port 3001) pour les déploiements où aucune
  // gateway Caddy n'existe (ex. application Windows packagée en .exe).
  // Dans le sandbox, la gateway Caddy intercepte déjà ?XTransformPort=3001
  // avant que la requête n'atteigne Next.js — ces rewrites sont donc inertes
  // en développement et n'altèrent aucun comportement existant.
  async rewrites() {
    return [
      {
        source: "/:path*",
        has: [
          { type: "query", key: "XTransformPort", value: "3001" },
        ],
        destination: "http://127.0.0.1:3001/:path*",
      },
    ];
  },
};

export default nextConfig;
