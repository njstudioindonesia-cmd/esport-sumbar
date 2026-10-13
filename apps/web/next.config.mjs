/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@esport-sumbar/ui', '@esport-sumbar/contracts', '@esport-sumbar/utils'],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
