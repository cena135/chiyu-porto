import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone build => image Docker kecil, tidak perlu node_modules penuh.
  output: "standalone",
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
