/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    trace: {
      serviceName: 'datadog-otel-poc',
    },
  },
}

module.exports = nextConfig
