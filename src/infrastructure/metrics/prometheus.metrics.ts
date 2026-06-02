import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import type { IMetrics } from '../../domain/ports/metrics.port.js';

export class PrometheusMetrics implements IMetrics {
  readonly registry: Registry;
  private readonly commandsTotal: Counter;
  private readonly commandLatency: Histogram;
  private readonly errorsTotal: Counter;
  private readonly activeGuilds: Gauge;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });

    this.commandsTotal = new Counter({
      name: 'discord_bot_commands_total',
      help: 'Total number of commands executed',
      labelNames: ['command'],
      registers: [this.registry],
    });

    this.commandLatency = new Histogram({
      name: 'discord_bot_command_latency_ms',
      help: 'Command execution latency in milliseconds',
      labelNames: ['command'],
      buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
      registers: [this.registry],
    });

    this.errorsTotal = new Counter({
      name: 'discord_bot_errors_total',
      help: 'Total number of errors',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.activeGuilds = new Gauge({
      name: 'discord_bot_active_guilds',
      help: 'Number of guilds the bot is in',
      registers: [this.registry],
    });
  }

  incrementCommandExecuted(commandName: string): void {
    this.commandsTotal.inc({ command: commandName });
  }

  recordCommandLatency(commandName: string, durationMs: number): void {
    this.commandLatency.observe({ command: commandName }, durationMs);
  }

  incrementError(type: string): void {
    this.errorsTotal.inc({ type });
  }

  setActiveGuilds(count: number): void {
    this.activeGuilds.set(count);
  }
}
