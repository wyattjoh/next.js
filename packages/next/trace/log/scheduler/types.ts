export abstract class Scheduler {
  public abstract execute(): void
  public abstract schedule(): void
  public onExecute?: () => void
}
