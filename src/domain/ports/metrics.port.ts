export interface IMetrics {
  incrementCommandExecuted(commandName: string): void;
  recordCommandLatency(commandName: string, durationMs: number): void;
  incrementError(type: string): void;
  setActiveGuilds(count: number): void;
}
