import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  sassOptions: {
    additionalData: `$var: red;`,
  },
};

export default nextConfig;
