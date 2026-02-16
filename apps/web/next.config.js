const path = require('path');

// Carrega .env: primeiro apps/web (local), depois monorepo e services/api (DATABASE_URL, JWT, etc.)
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../services/api/.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nebula-finance/ui', 'jose'],
  reactStrictMode: true,
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  webpack: (config, { isServer }) => {
    // Garante que o Next resolva módulos do monorepo (ex.: jose no root node_modules)
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
      'node_modules',
    ];
    return config;
  },
};

module.exports = nextConfig;
