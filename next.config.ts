import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pfp.acsfutureschool.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pub-8ef5e1ba758a441ab28c0b9bcbc93a55.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pub-de86fc8fea3047248c160c647017965e.r2.dev",
      },
      {
        protocol: "https",
        hostname: "cse.buet.ac.bd",
      },
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
      },
      {
        protocol: "https",
        hostname: "www.cpajournal.com",
      },
      {
        protocol: "https",
        hostname: "pub-432a927ff784474fa49c9320e6a2bb13.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pfp.acsfutureschool.com",
      },
      {
        protocol: "https",
        hostname: "ico.vercel.app",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "community.acsfutureschool.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/secondary/:path*",
        destination: "https://guidelinebox.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
