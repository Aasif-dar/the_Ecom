import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Admin can add product images by URL in the demo; a real deployment would pin this to its CDN host.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  poweredByHeader: false,
};

export default nextConfig;
