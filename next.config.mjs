/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    domains: ["localhost", "via.placeholder.com", "tse1.mm.bing.net"],
  },
};

export default nextConfig;
