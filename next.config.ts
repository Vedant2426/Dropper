import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site reads files from content/ at request time, so make sure the
  // folder is bundled with every serverless function.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
};

export default nextConfig;
