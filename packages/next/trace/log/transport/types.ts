import { LogRecord } from '../types'

export interface Transport {
  send(records: LogRecord[]): Promise<void>
}
