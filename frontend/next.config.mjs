/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore pino-pretty warning for WalletConnect
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
    };
    
    // Ignore specific warnings
    config.ignoreWarnings = [
      /Module not found: Can't resolve 'pino-pretty'/,
    ];
    
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.walletconnect.com https://*.walletconnect.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: ipfs:; connect-src 'self' https: wss:; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self' https://verify.walletconnect.org https://verify.walletconnect.com https://*.walletconnect.org https://*.walletconnect.com https://safe.global https://*.safe.global;"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          }
        ],
      },
    ];
  },
};

export default nextConfig
