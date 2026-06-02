import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { UpsertGuildConfigUseCase } from '../../../application/guild/index.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import type { IDiscordCommand } from './base.command.js';

export class ConfigCommand implements IDiscordCommand {
  readonly data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure the bot for this server')
    .addSubcommand((sub) =>
      sub
        .setName('prefix')
        .setDescription('Set the command prefix')
        .addStringOption((opt) =>
          opt.setName('value').setDescription('New prefix (max 5 chars)').setRequired(true),
        ),
    ) as SlashCommandBuilder;

  constructor(
    private readonly upsertGuildConfig: UpsertGuildConfigUseCase,
    private readonly logger: ILogger,
  ) {}

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) {
      await interaction.reply({
        content: 'This command must be used in a server.',
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'prefix') {
      const value = interaction.options.getString('value', true);

      const result = await this.upsertGuildConfig.execute({
        guildId: interaction.guildId,
        prefix: value,
      });

      if (!result.ok) {
        await interaction.reply({ content: `Error: ${result.error.message}`, ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle('Configuration updated')
        .addFields({ name: 'Prefix', value: `\`${result.value.prefix.value}\`` });

      await interaction.reply({ embeds: [embed], ephemeral: true });
      this.logger.info('Config command executed', { guildId: interaction.guildId });
    }
  }
}
