import { nextCookies } from "better-auth/next-js";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.externals.push({
      'pg-hstore': 'commonjs pg-hstore',
      'bufferutil': 'commonjs bufferutil',
      'utf-8-validate': 'commonjs utf-8-validate',
      'supports-color': 'commonjs supports-color',
      'net': 'commonjs net',
      'tls': 'commonjs tls',
    });

    return config;
  },
};

export default nextConfig;
