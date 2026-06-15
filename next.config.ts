import type { NextConfig } from "next";

// next-pwa v5 uses webpack; skip it in development to avoid Turbopack conflict.
// In production the build uses webpack anyway.
const isDev = process.env.NODE_ENV === "development";

let nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

if (!isDev) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withPWA = require("next-pwa");
  const pwaConfig = withPWA({
    dest: "public",
    disable: false,
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "lawnguide-cache",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
        },
      },
    ],
  });
  nextConfig = pwaConfig(nextConfig);
}

export default nextConfig;
