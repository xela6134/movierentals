/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',                        // Match /api/... in browser
        destination: 'http://localhost:8000/:path*',  // Proxy to Flask
      },
    ];
  },
};

module.exports = nextConfig;
