import type { ChannelSelectMenuInteraction } from 'discord.js';
import type { UpdateWelcomeChannelUseCase } from '../../../application/guild/use-cases/update-welcome-channel.use-case.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import type { IComponentHandler } from './component-registry.js';

export class WelcomeChannelSelectHandler implements IComponentHandler {
  readonly customId = 'welcome-channel-select';

  constructor(
    private readonly updateWelcomeChannel: UpdateWelcomeChannelUseCase,
    private readonly logger: ILogger,
  ) {}

  async execute(interaction: ChannelSelectMenuInteraction): Promise<void> {
    if (!interaction.guildId) return;
    const channelId = interaction.values[0] ?? null;

    const result = await this.updateWelcomeChannel.execute({
      guildId: interaction.guildId,
      channelId,
    });

    if (!result.ok) {
      await interaction.update({ content: `Erreur : ${result.error.message}`, components: [] });
      return;
    }

    const channelMention = channelId ? `<#${channelId}>` : 'désactivé';
    await interaction.update({
      content: `✅ Canal de bienvenue configuré : ${channelMention}`,
      components: [],
    });
  }
}
