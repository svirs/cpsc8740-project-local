import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.VERCEL_ENV !== "production"
            ? "http://127.0.0.1:8000/:path*"
            : "https://svirs.pythonanywhere.com/:path*",
      },
    ];
  },
};

export default nextConfig;
