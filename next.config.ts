/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  output: 'standalone', // This helps Vercel package the app correctly
};

export default nextConfig;
