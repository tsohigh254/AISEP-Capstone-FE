import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const backendImagePattern = backendUrl
  ? (() => {
      try {
        const url = new URL(backendUrl);
        return {
          protocol: url.protocol.replace(":", "") as "http" | "https",
          hostname: url.hostname,
          ...(url.port ? { port: url.port } : {}),
        };
      } catch {
        return null;
      }
    })()
  : null;

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'thesvg.org',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      ...(backendImagePattern ? [backendImagePattern] : []),
    ],
  },
};

export default nextConfig;
