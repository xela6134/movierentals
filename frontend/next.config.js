/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      // production
      return [
        {
          source: '/api/:path*',
          destination: 'https://movierentals-production.up.railway.app/:path*'
        },
      ];
    } else {
      // local dev
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/:path*'
        },
      ];
    }
  },
};

module.exports = nextConfig;
