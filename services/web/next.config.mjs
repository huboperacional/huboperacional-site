/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  // Standalone runtime (node:20-slim) has no sharp — serve images as-is (logos, OG).
  images: { unoptimized: true },
  async redirects() {
    return [
      // Bare /new-client → default language (funnel short URL).
      { source: '/new-client', destination: '/new-client/pt-br', permanent: false },
    ];
  },
};

export default nextConfig;
