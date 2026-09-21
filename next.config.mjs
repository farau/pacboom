/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi'],
  },
};

export default nextConfig;
