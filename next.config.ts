/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // This stops Vercel from trying to pre-render pages that need API keys
  output: 'standalone', 
};

export default nextConfig;