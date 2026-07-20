import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone", // lean Docker image — see web/Dockerfile
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // Real uploaded property/avatar photos — see api/properties/serializers.py's
      // Cloudinary URL builder. Missing this silently blocked every real photo
      // (property cards, host rows, avatars) from ever rendering.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
}

export default nextConfig
