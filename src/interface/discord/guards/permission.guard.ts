import type { ChatInputCommandInteraction } from 'discord.js';

export function checkPermission(
  interaction: ChatInputCommandInteraction,
  requiredPermissions: bigint[],
): boolean {
  if (requiredPermissions.length === 0) return true;
  if (!interaction.memberPermissions) return false;
  return interaction.memberPermissions.has(requiredPermissions);
}
