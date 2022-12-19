/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    trace: {
      serviceName: 'datadog-otel-poc',
      logging: {
        // When true, this enables automatic patching of the Console API to send
        // messages over to the configured OpenTelemetry endpoint.
        patchConsole: true,
        // (Optional) The URL for which the log lines will be sent to via JSON
        // encoded HTTP-POST.
        // Defaults to `http://localhost:4318/v1/logs`.
        // endpoint: 'http://localhost:4318/v1/logs',
        // (Optional) The maximum number of log items to collect before
        // flushing. When logs are being emitted, if this maximum is reached
        // before the logs are scheduled to be sent, it will be sent
        // immediately. Defaults to `100`.
        // maxBatchSize: 100,
      },
    },
  },
}

module.exports = nextConfig
