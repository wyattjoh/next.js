type SpanProcessorConfig =
  | {
      processorType: 'simple'
    }
  | {
      processorType: 'batch'
      exportTimeoutMillis?: number
      maxExportBatchSize?: number
      maxQueueSize?: number
      scheduledDelayMillis?: number
    }

interface LoggingConfig {
  /**
   * The maximum number of log items to collect before flushing. When logs are
   * being emitted, if this maximum is reached before the logs are scheduled to
   * be sent, it will be sent immediately.
   */
  maxBatchSize?: number

  /**
   * The URL for which the log lines will be sent to via JSON encoded HTTP-POST.
   */
  httpTransportURL?: string
}

interface TraceConfig {
  serviceName: string
  /**
   * Name for the default tracer instance. If not specified, will use serviceName instead.
   */
  defaultTracerName?: string
  spanProcessorConfig?: SpanProcessorConfig

  /**
   * Patch the Console API to automatically send log lines emitted using it to
   * the OpenTelemetry endpoint via JSON-HTTP.
   */
  logging?: LoggingConfig

  /**
   * Enable console span processor to emit spans into console instead.
   * This will DISABLE exporter to actually send spans into collector.
   */
  debug?: boolean
}

export { SpanProcessorConfig, TraceConfig }
