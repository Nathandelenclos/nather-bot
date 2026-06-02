import type { Client } from 'discord.js';
import type { ILogger } from '../../domain/ports/logger.port.js';
import type { CommandRegistry } from './command-registry.js';
import { type IDiscordEvent, registerEvents } from './events/base.event.js';

export class Bot {
  constructor(
    private readonly client: Client,
    private readonly commandRegistry: CommandRegistry,
    private readonly events: IDiscordEvent[],
    private readonly logger: ILogger,
  ) {}

  async start(token: string): Promise<void> {
    registerEvents(this.client, this.events);
    await this.client.login(token);
    this.logger.info('Bot starting...');
  }

  async stop(): Promise<void> {
    this.client.destroy();
    this.logger.info('Bot stopped.');
  }

  getCommandRegistry(): CommandRegistry {
    return this.commandRegistry;
  }
}
