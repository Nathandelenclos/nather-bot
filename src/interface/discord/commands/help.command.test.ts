import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';
import { CommandRegistry } from '../command-registry.js';
import type { IDiscordCommand } from './base.command.js';
import { HelpCommand } from './help.command.js';

function makeCommand(name: string, description: string): IDiscordCommand {
  return {
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription(description) as SlashCommandBuilder,
    execute: vi.fn(),
  };
}

function makeInteraction(): ChatInputCommandInteraction {
  return {
    reply: vi.fn().mockResolvedValue(undefined),
    user: { id: '123456789012345678' },
  } as unknown as ChatInputCommandInteraction;
}

describe('HelpCommand', () => {
  it('has name "help" and a non-empty description', () => {
    const registry = new CommandRegistry();
    const cmd = new HelpCommand(registry);

    expect(cmd.data.name).toBe('help');
    expect(cmd.data.description.length).toBeGreaterThan(0);
  });

  it('replies with an ephemeral embed listing all registered commands', async () => {
    const registry = new CommandRegistry();
    registry.register(makeCommand('ping', 'Replies with Pong'));
    registry.register(makeCommand('config', 'Configure the bot'));
    const cmd = new HelpCommand(registry);
    const interaction = makeInteraction();

    await cmd.execute(interaction);

    expect(interaction.reply).toHaveBeenCalledOnce();
    const call = vi.mocked(interaction.reply).mock.calls[0][0] as {
      embeds: unknown[];
      ephemeral: boolean;
    };
    expect(call.ephemeral).toBe(true);
    expect(call.embeds).toHaveLength(1);
  });

  it('embed contains one field per registered command', async () => {
    const registry = new CommandRegistry();
    registry.register(makeCommand('ping', 'Replies with Pong'));
    registry.register(makeCommand('config', 'Configure the bot'));
    const cmd = new HelpCommand(registry);
    const interaction = makeInteraction();

    await cmd.execute(interaction);

    const call = vi.mocked(interaction.reply).mock.calls[0][0] as {
      embeds: { data: { fields: { name: string; value: string }[] } }[];
    };
    const fields = call.embeds[0].data.fields;
    expect(fields).toHaveLength(2);
    expect(fields.map((f) => f.name)).toContain('/ping');
    expect(fields.map((f) => f.name)).toContain('/config');
  });
});
