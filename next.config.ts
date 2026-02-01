/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  // This stops Vercel from trying to pre-render pages that need API keys
  output: 'standalone', 
};

export default nextConfig;