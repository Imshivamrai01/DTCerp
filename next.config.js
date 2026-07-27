/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Allows server actions and API routes to work correctly
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Allow CommonJS modules in the models/ directory
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
