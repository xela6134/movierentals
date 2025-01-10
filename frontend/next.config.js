/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',         // Match /api/... in the browser
        destination: 'http://localhost:5000/:path*', // Proxy to Flask
      },
    ];
  },
};

module.exports = nextConfig;
