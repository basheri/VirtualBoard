import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '100.124.139.56:3000'],
    },
  },
  webpack: (config, { dev }) => {
    config.resolve.modules.push(path.resolve(__dirname, 'node_modules'));
    
    // تحسين HMR في وضع التطوير
    if (dev) {
      config.watchOptions = {
        ignored: ['**/node_modules/**', '**/.git/**'],
        aggregateTimeout: 300,
        poll: 1000,
      };
    }
    
    return config;
  },
};

export default nextConfig;
