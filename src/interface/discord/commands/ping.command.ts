import { type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import type { IMetrics } from '../../../domain/ports/metrics.port.js';
import type { IDiscordCommand } from './base.command.js';

export class PingCommand implements IDiscordCommand {
  readonly data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong and the bot latency') as SlashCommandBuilder;

  constructor(
    private readonly logger: ILogger,
    private readonly metrics: IMetrics,
  ) {}

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const start = Date.now();
    await interaction.reply({ content: 'Pong!', ephemeral: true });
    const latency = Date.now() - start;

    this.metrics.recordCommandLatency('ping', latency);
    this.logger.debug('Ping command executed', { latency, userId: interaction.user.id });
  }
}
