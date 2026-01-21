import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  sassOptions: {
    additionalData: `$var: red;`,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.bowwe.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
