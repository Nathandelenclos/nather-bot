import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { CommandRegistry } from '../command-registry.js';
import type { IDiscordCommand } from './base.command.js';

export class HelpCommand implements IDiscordCommand {
  readonly data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Liste toutes les commandes disponibles');

  constructor(private readonly registry: CommandRegistry) {}

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const commands = this.registry.all();

    const embed = new EmbedBuilder()
      .setTitle('Commandes disponibles')
      .setColor(0x5865f2)
      .addFields(
        commands.map((c) => ({
          name: `/${c.data.name}`,
          value: c.data.description,
          inline: false,
        })),
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
