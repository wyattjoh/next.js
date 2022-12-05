import { Scheduler } from './types'

/**
 * The TickScheduler will invoke at the next process tick.
 */
export class TickScheduler extends Scheduler {
  private batchScheduled = false

  static readonly isSupported = typeof process.nextTick !== 'undefined'

  public execute(): void {
    this.batchScheduled = false

    if (!this.onExecute) {
      return
    }
    this.onExecute()
  }

  public schedule(): void {
    if (this.batchScheduled) {
      return
    }
    this.batchScheduled = true

    // Batch all the log lines to be sent on the next process tick. This ensures
    // that we only send a single batch per synchronous execution tick.
    process.nextTick(this.execute.bind(this))
  }
}
