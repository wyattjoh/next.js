export interface LogRecord {
  timestamp?: number
  body?: string
  traceFlags?: string
  traceId?: string
  spanId?: string
}
