/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@esport-sumbar/ui',
    '@esport-sumbar/ui-dashboard',
    '@esport-sumbar/contracts',
    '@esport-sumbar/auth-client',
    '@esport-sumbar/api-client',
    '@esport-sumbar/utils',
  ],
  reactStrictMode: true,
};

export default nextConfig;
