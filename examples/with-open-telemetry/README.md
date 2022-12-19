This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Run this example

This examples requires a [Datadog API key](https://app.datadoghq.com/organization-settings/api-keys).

In a first terminal, run the Next.js example from the root of the Next.js repository.

```sh
pnpm install
pnpm build
DD_API_KEY=xxx pnpm next examples/with-open-telemetry
```

In another terminal, run the OpenTelemetry collector that will forward traces to Datadog:

```sh
# With Podman
DD_API_KEY=xxx podman run --rm --name datadog -p 4318:4318 -e DD_API_KEY=$DD_API_KEY -v $PWD/examples/with-open-telemetry/otel-config.yaml:/etc/otelcol-contrib/config.yaml --hostname $(hostname) otel/opentelemetry-collector-contrib:0.67.0
# With Docker
DD_API_KEY=xxx docker run --rm --name datadog -p 4318:4318 -e DD_API_KEY=$DD_API_KEY -v $PWD/examples/with-open-telemetry/otel-config.yaml:/etc/otelcol-contrib/config.yaml --hostname $(hostname) otel/opentelemetry-collector-contrib:0.67.0
```

Then go to http://localhost:3000/api/hello, and check in Datadog:

- [traces](https://app.datadoghq.com/apm/traces?query=%40_top_level%3A1%20service%3Adatadog-otel-poc)
- [logs](https://app.datadoghq.com/logs?query=service%3Adatadog-otel-poc)

Logs should also be printed to the console of the running OpenTelemetry collector as the logging exporter has been configured.
