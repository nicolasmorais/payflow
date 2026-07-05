import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-da9fd1c19b8e45d691d67626b9a7ba6d.r2.dev",
      },
    ],
  },
};

export default nextConfig;
