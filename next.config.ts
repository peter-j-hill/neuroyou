import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/train', destination: '/protocols', permanent: true },
    ]
  },
};

export default nextConfig;
