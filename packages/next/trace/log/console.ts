import { NoopScheduler } from './scheduler/noop'
import { TickScheduler } from './scheduler/tick'
import { JSONHTTPTransport } from './transport/json-http'
import { LogRecordCollector } from './log-record-collector'

function replace<T>(
  source: T,
  name: keyof T,
  replacer: (original: any) => any
) {
  const original = source[name]
  const replacement = replacer(original)
  source[name] = replacement
}

let isConsolePatched = false

type PatchConsoleOptions = {
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

export function patchConsole({
  maxBatchSize = 100,
  httpTransportURL,
}: PatchConsoleOptions) {
  if (isConsolePatched) return
  isConsolePatched = true

  // If `process.nextTick` is available, use that, otherwise (like in edge),
  // just send log entries directly instead.
  const scheduler = TickScheduler.isSupported
    ? new TickScheduler()
    : new NoopScheduler()

  const transport = new JSONHTTPTransport(httpTransportURL)

  const collector = new LogRecordCollector(maxBatchSize, transport, scheduler)

  const levels: Array<keyof typeof console> = [
    'debug',
    'error',
    'info',
    'log',
    'trace',
    'warn',
  ]

  // For each of the log levels, patch and replace the original method with one
  // that additionally forwards to the collector.
  for (const level of levels) {
    replace(console, level, (original) => (...args: any[]) => {
      original(...args)
      collector.push(args.map((arg) => String(arg)).join(' '))
    })
  }
}
