import type { Interaction } from 'discord.js';
import type { LogCommandUseCase } from '../../../application/command-log/index.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import type { IMetrics } from '../../../domain/ports/metrics.port.js';
import type { CommandRegistry } from '../command-registry.js';
import { checkPermission } from '../guards/permission.guard.js';
import type { IDiscordEvent } from './base.event.js';

export class InteractionCreateEvent implements IDiscordEvent<'interactionCreate'> {
  readonly name = 'interactionCreate' as const;
  readonly once = false;

  constructor(
    private readonly commandRegistry: CommandRegistry,
    private readonly logCommand: LogCommandUseCase,
    private readonly logger: ILogger,
    private readonly metrics: IMetrics,
  ) {}

  async execute(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command = this.commandRegistry.get(interaction.commandName);
    if (!command) {
      this.logger.warn('Unknown command', { name: interaction.commandName });
      return;
    }

    if (command.requiredPermissions && !checkPermission(interaction, command.requiredPermissions)) {
      await interaction.reply({
        content: "Vous n'avez pas les permissions requises pour cette commande.",
        ephemeral: true,
      });
      return;
    }

    const start = Date.now();

    try {
      await command.execute(interaction);
      this.metrics.recordCommandLatency(interaction.commandName, Date.now() - start);

      if (interaction.guildId) {
        void this.logCommand.execute({
          guildId: interaction.guildId,
          userId: interaction.user.id,
          commandName: interaction.commandName,
        });
      }
    } catch (err) {
      this.metrics.incrementError('command_execution');
      this.logger.error('Command execution failed', {
        command: interaction.commandName,
        err: String(err),
      });

      const errorMessage = { content: 'An error occurred. Please try again.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  }
}
