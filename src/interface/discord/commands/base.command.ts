import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface IDiscordCommand {
  readonly data: SlashCommandBuilder;
  readonly requiredPermissions?: bigint[];
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
