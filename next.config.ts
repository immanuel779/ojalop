import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",   // default is 1mb — phone photos exceed it
    },
  },
};
export default nextConfig;