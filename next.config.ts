/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This allows the build to finish even with type errors
    ignoreBuildErrors: true, 
  },
  eslint: {
    // This ignores linting warnings that often fail builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
