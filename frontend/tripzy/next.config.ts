import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.29.15', 'localhost', '127.0.0.1'],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
  // Required for Google Identity Services (GIS) popup flow.
  // Without same-origin-allow-popups, the browser blocks the postMessage
  // from the Google sign-in popup back to the parent window.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
