import { PermissionFlagsBits, PermissionsBitField } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { checkPermission } from './permission.guard.js';

function makeInteraction(permissions: bigint[] | null): ChatInputCommandInteraction {
  return {
    memberPermissions: permissions === null ? null : new PermissionsBitField(permissions),
    reply: () => Promise.resolve(),
  } as unknown as ChatInputCommandInteraction;
}

describe('checkPermission', () => {
  it('returns true when no permissions are required', () => {
    const interaction = makeInteraction([]);
    expect(checkPermission(interaction, [])).toBe(true);
  });

  it('returns true when member has the required permission', () => {
    const interaction = makeInteraction([PermissionFlagsBits.ManageGuild]);
    expect(checkPermission(interaction, [PermissionFlagsBits.ManageGuild])).toBe(true);
  });

  it('returns false when member lacks the required permission', () => {
    const interaction = makeInteraction([PermissionFlagsBits.SendMessages]);
    expect(checkPermission(interaction, [PermissionFlagsBits.ManageGuild])).toBe(false);
  });

  it('returns false when memberPermissions is null', () => {
    const interaction = makeInteraction(null);
    expect(checkPermission(interaction, [PermissionFlagsBits.ManageGuild])).toBe(false);
  });

  it('returns true when member has all required permissions', () => {
    const interaction = makeInteraction([
      PermissionFlagsBits.ManageGuild,
      PermissionFlagsBits.Administrator,
    ]);
    expect(
      checkPermission(interaction, [
        PermissionFlagsBits.ManageGuild,
        PermissionFlagsBits.Administrator,
      ]),
    ).toBe(true);
  });

  it('returns false when member has only some of the required permissions', () => {
    const interaction = makeInteraction([PermissionFlagsBits.SendMessages]);
    expect(
      checkPermission(interaction, [
        PermissionFlagsBits.ManageGuild,
        PermissionFlagsBits.Administrator,
      ]),
    ).toBe(false);
  });
});
