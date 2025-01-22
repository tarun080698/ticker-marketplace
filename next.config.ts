import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // images: {
  //   domains: [
  //     "d3vhc53cl8e8km.cloudfront.net",
  //     "uncommon-albatross-829.convex.cloud",
  //   ],
  // },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3vhc53cl8e8km.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "uncommon-albatross-829.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
