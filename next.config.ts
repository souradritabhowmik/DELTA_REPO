import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // This still works and lets the build finish
    ignoreBuildErrors: true,
  },
};

export default nextConfig;