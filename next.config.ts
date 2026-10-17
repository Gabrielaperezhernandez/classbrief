import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind CSS is processed by this loader.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
