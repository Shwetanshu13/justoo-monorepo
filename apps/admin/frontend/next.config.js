/** @type {import('next').NextConfig} */
const nextConfig = {
    // In dev, speed up by disabling reactStrictMode if needed
    reactStrictMode: true,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'no-store, must-revalidate' },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3002/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
