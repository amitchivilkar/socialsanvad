import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/sampark", destination: "/contact", permanent: true },
      { source: "/niyam", destination: "/terms", permanent: true },
      { source: "/gopanita", destination: "/privacy", permanent: true },
      { source: "/paratava", destination: "/refunds", permanent: true },
      { source: "/majhyabadal", destination: "/about", permanent: true },
      { source: "/sansadhane", destination: "/resources", permanent: true },
      { source: "/sansadhane/:path*", destination: "/resources/:path*", permanent: true },
      { source: "/shodh", destination: "/search", permanent: true },
      { source: "/lekha", destination: "/articles", permanent: true },
      { source: "/lekha/:slug", destination: "/articles/:slug", permanent: true },
      { source: "/vishay", destination: "/topics", permanent: true },
      { source: "/vishay/:slug", destination: "/topics/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
