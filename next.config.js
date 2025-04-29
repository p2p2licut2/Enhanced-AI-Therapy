/** @type {import('next').NextConfig} */

// Analiză bundle când este necesar
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')()
  : (config) => config;

// PWA config
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Optimizări imagini
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Optimizări pentru compilare
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Configurare webpack personalizată 
  webpack(config) {
    // Optimizări pentru CSS
    config.module.rules.forEach((rule) => {
      const { oneOf } = rule;
      if (oneOf) {
        oneOf.forEach((one) => {
          if (!`${one.issuer?.and}`.includes('_app')) return;
          one.issuer.and = [path.resolve(__dirname)];
        });
      }
    });
    
    return config;
  },
};

// Aplicăm toate wrapper-ele de configurare
module.exports = withBundleAnalyzer(withPWA(nextConfig));