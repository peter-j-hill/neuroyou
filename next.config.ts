import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/train', destination: '/protocols', permanent: true },
      // The first version of Neutralize (old dark pages) became the Protocols course.
      { source: '/neutralize', destination: '/offers/neutralize', permanent: true },
      { source: '/neutralize/success', destination: '/protocols/neutralize', permanent: true },
      { source: '/neutralize/:moduleId', destination: '/protocols/neutralize', permanent: true },
    ]
  },
};

export default nextConfig;
