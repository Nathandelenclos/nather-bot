import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface IDiscordCommand {
  readonly data: SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
