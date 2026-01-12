import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow production build even if there are type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
