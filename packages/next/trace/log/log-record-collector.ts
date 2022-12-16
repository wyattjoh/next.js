import { type LogRecord } from './types'
import { type Scheduler } from './scheduler/types'
import { type Transport } from './transport/types'
import { getTracer } from '../../server/lib/trace/tracer'

export class LogRecordCollector {
  private queue: Array<LogRecord> = []

  constructor(
    private readonly maxBatchSize: number,
    private readonly transport: Transport,
    private readonly scheduler: Scheduler
  ) {
    // When the scheduler executes, flush the log queue to the transport.
    this.scheduler.onExecute = this.flush.bind(this)
  }

  private flush() {
    if (this.queue.length === 0) {
      return
    }

    const records = this.queue.slice()
    this.queue = []

    this.transport
      .send(records)
      .then(() => {
        // TODO: (wyattjoh) implement
      })
      .catch(() => {
        // TODO: (wyattjoh) implement
      })
  }

  private format(body: string): LogRecord {
    // Convert the timestamp in milliseconds to nanoseconds as expected by the
    // OTEL collector.
    const timeUnixNano = Date.now() * 1e6

    const packet: LogRecord = { timeUnixNano, body: { string_value: body } }

    // Get the active span. If we're not in one, then just return the packet
    // without any span details.
    const spanContext = getTracer().getActiveScopeSpan()?.spanContext()
    if (!spanContext) {
      return packet
    }

    // Formatted according to https://www.w3.org/TR/trace-context/#trace-id
    packet.traceId = spanContext.traceId

    // Formatted according to https://www.w3.org/TR/trace-context/#parent-id
    packet.spanId = spanContext.spanId

    // Formatted according to https://www.w3.org/TR/trace-context/#trace-flags
    packet.traceFlags = `0${spanContext.traceFlags.toString(16)}`

    return packet
  }

  public push(body: string) {
    this.queue.push(this.format(body))

    if (this.queue.length >= this.maxBatchSize) {
      this.scheduler.execute()
    } else {
      this.scheduler.schedule()
    }
  }
}
