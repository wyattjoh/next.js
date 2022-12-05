This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Run this example

This examples requires cloning https://github.com/kwonoj/next.js/pull/7 and a [Datadog API key](https://app.datadoghq.com/organization-settings/api-keys).

In a first terminal, run the Next.js example:

```sh
git clone git@github.com:kwonoj/next.js.git nextjs-otel
cd nextjs-otel
pnpm i
(cd examples/with-open-telemetry && npm i)
pnpm build
DD_API_KEY=xxx pnpm next examples/with-open-telemetry
```

In another terminal, run the OpenTelemetry collector that will forward traces to Datadog:

```sh
DD_API_KEY=xxx npm run collector
```

Then go to http://localhost:3000/api/hello, and check in Datadog:

- [traces](https://app.datadoghq.com/apm/traces?query=%40_top_level%3A1%20service%3Adatadog-otel-poc)
- [logs](https://app.datadoghq.com/logs?query=service%3Adatadog-otel-poc)
