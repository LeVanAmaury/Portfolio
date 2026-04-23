import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permet à la route API chat de streamer les réponses Gemini
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
