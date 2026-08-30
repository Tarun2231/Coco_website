/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/profile', destination: '/dashboard/profile', permanent: true },
      { source: '/vaccinations', destination: '/dashboard/vaccinations', permanent: true },
      { source: '/expenses', destination: '/dashboard/expenses', permanent: true },
      { source: '/reminders', destination: '/dashboard/reminders', permanent: true },
      { source: '/qr-code', destination: '/dashboard/qr-code', permanent: true },
      { source: '/messages', destination: '/dashboard/messages', permanent: true },
      { source: '/analytics', destination: '/dashboard/analytics', permanent: true },
      { source: '/settings', destination: '/dashboard/settings', permanent: true },
    ];
  },
};

export default nextConfig;

