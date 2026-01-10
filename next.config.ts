import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'informartica-wordpress-993d7e-147-79-106-82.traefik.me',
      },
      {
        protocol: 'https',
        hostname: 'informartica-wordpress-993d7e-147-79-106-82.traefik.me',
      },
    ],
  },
};

export default nextConfig;
