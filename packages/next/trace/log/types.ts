/**
 * LogRecord is the data structure accepted by the OTEL collector. This is
 * described in a JSON Protobuf encoding. This was based on the types seen
 * below.
 *
 * @see {@link https://github.com/open-telemetry/opentelemetry-collector/blob/fdc80a3bea75be80b2fc5be5c755377c93d2acd6/pdata/internal/data/protogen/logs/v1/logs.pb.go}
 */
export interface LogRecord {
  timeUnixNano?: number
  traceId?: string
  spanId?: string
  traceFlags?: string
  body?: { string_value: string }
}
