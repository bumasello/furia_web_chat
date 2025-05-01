import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/:path*", // rota no Frontend
        destination: "http://localhost:8080/:path*",
      },
    ];
  },
};

export default nextConfig;
