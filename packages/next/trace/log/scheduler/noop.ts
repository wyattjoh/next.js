import { Scheduler } from './types'

/**
 * The NoopScheduler will always execute every time the scheduler is  invoked.
 */
export class NoopScheduler extends Scheduler {
  public execute(): void {
    if (!this.onExecute) {
      return
    }

    this.onExecute()
  }

  public schedule(): void {
    this.execute()
  }
}
