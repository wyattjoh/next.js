import { createLogger, format, http, transports } from 'winston'
const {
  getTracer,
}: typeof import('next/server/lib/trace/tracer') = require('next/dist/server/lib/trace/tracer')

const httpTransport = new transports.Http({
  host: 'http-intake.logs.datadoghq.com',
  path: `/api/v2/logs?dd-api-key=${process.env.DD_API_KEY}&ddsource=nodejs&service=datadog-otel-poc&ddtags=env:production`,
  ssl: true,
})

export const logger = createLogger({
  level: 'info',
  exitOnError: false,
  format: format.combine(tracingFormat(), format.json()),
  transports: [new transports.Console(), httpTransport],
})

function tracingFormat() {
  return format((info) => {
    const tracer = getTracer()
    const span = tracer.getActiveScopeSpan()
    if (span) {
      const spanContext = span.spanContext()
      const traceIdEnd = spanContext.traceId.slice(
        spanContext.traceId.length / 2
      )
      info['dd.trace_id'] = toNumberString(fromString(traceIdEnd, 16))
      info['dd.span_id'] = toNumberString(fromString(spanContext.spanId, 16))
    }
    return info
  })()
}

const UINT_MAX = 4294967296

// Convert a buffer to a numerical string.
function toNumberString(buffer, radix = 10) {
  let high = readInt32(buffer, 0)
  let low = readInt32(buffer, 4)
  let str = ''

  radix = radix || 10

  while (1) {
    const mod = (high % radix) * UINT_MAX + low

    high = Math.floor(high / radix)
    low = Math.floor(mod / radix)
    str = (mod % radix).toString(radix) + str

    if (!high && !low) break
  }

  return str
}

// Convert a numerical string to a buffer using the specified radix.
function fromString(str, raddix) {
  const buffer = new Uint8Array(8)
  const len = str.length

  let pos = 0
  let high = 0
  let low = 0

  if (str[0] === '-') pos++

  const sign = pos

  while (pos < len) {
    const chr = parseInt(str[pos++], raddix)

    if (!(chr >= 0)) break // NaN

    low = low * raddix + chr
    high = high * raddix + Math.floor(low / UINT_MAX)
    low %= UINT_MAX
  }

  if (sign) {
    high = ~high

    if (low) {
      low = UINT_MAX - low
    } else {
      high++
    }
  }

  writeUInt32BE(buffer, high, 0)
  writeUInt32BE(buffer, low, 4)

  return buffer
}

// Write unsigned integer bytes to a buffer.
function writeUInt32BE(buffer, value, offset) {
  buffer[3 + offset] = value & 255
  value = value >> 8
  buffer[2 + offset] = value & 255
  value = value >> 8
  buffer[1 + offset] = value & 255
  value = value >> 8
  buffer[0 + offset] = value & 255
}

// Read a buffer to unsigned integer bytes.
function readInt32(buffer, offset) {
  return (
    buffer[offset + 0] * 16777216 +
    (buffer[offset + 1] << 16) +
    (buffer[offset + 2] << 8) +
    buffer[offset + 3]
  )
}
