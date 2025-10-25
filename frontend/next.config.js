/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Enable static export for Netlify
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    unoptimized: true, // Required for static export
    domains: [
      "localhost",
      "rescueradar.netlify.app",
      "rescueradar-backend.vercel.app",
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Optimize bundle size
    if (!dev) {
      config.optimization.splitChunks.chunks = "all";
    }

    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Handle static files
        {
          source: "/static/:path*",
          destination: "/static/:path*",
        },
      ],
      fallback: [
        {
          source: "/api/:path*",
          destination:
            process.env.NODE_ENV === "production"
              ? "https://rescueradar-backend.vercel.app/api/:path*"
              : "http://localhost:5000/api/:path*",
        },
      ],
    };
  },
};

module.exports = nextConfig;
