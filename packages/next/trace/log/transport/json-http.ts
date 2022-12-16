import fetch from 'next/dist/compiled/node-fetch'
import { Transport } from './types'
import http from 'http'
import https from 'https'
import { LogRecord } from '../types'

/**
 * LogsData is the data structure accepted by the OTEL collector via the HTTP
 * receiver. This structure was reverse engineered from the source code.
 *
 * @see {@link https://github.com/open-telemetry/opentelemetry-collector/blob/fdc80a3bea75be80b2fc5be5c755377c93d2acd6/pdata/internal/data/protogen/logs/v1/logs.pb.go}
 */
interface LogsData {
  resourceLogs: {
    scopeLogs: {
      logRecords: LogRecord[]
    }[]
  }[]
}

/**
 * The JSONHTTPTransport will send HTTP POST requests with the log records as
 * JSON.
 */
export class JSONHTTPTransport implements Transport {
  private readonly agent: http.Agent | https.Agent

  constructor(private readonly url: string, private readonly maxAttempts = 3) {
    // Configure the http(s) agent so we can re-use the connection.
    this.agent = url.startsWith('https://')
      ? new https.Agent({ keepAlive: true })
      : new http.Agent({ keepAlive: true })
  }

  private async _send(body: string, attempt = 1): Promise<void> {
    // Send the log packet over HTTP.
    const res = await fetch(this.url, {
      // Reuse the http/https client to ideally reuse the same connection.
      agent: this.agent,
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body,
    })

    if (!res.ok) {
      // If we're past the max attempts, fail now.
      if (attempt >= this.maxAttempts) {
        throw new Error(`Could not send logs after ${attempt} attempts`)
      }

      // Exponential back-off between attempts = (1000 * 2 ^ attempt) in ms
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
      )

      // Send the request again.
      return this._send(body, attempt + 1)
    }
  }

  send(logRecords: LogRecord[]): Promise<void> {
    // format the log records into the correct format.
    const data: LogsData = {
      resourceLogs: [{ scopeLogs: [{ logRecords }] }],
    }

    return this._send(JSON.stringify(data))
  }
}
