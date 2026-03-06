import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dashboard to call the FastAPI backend
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
