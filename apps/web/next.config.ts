import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
  return [
    { source: "/", destination: "/legacy/index.html" },
  ];
},
};

export default nextConfig;