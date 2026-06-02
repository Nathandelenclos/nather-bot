import type { ChatInputCommandInteraction } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import type { IMetrics } from '../../../domain/ports/metrics.port.js';
import { PingCommand } from './ping.command.js';

const makeLogger = (): ILogger => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

const makeMetrics = (): IMetrics => ({
  incrementCommandExecuted: vi.fn(),
  recordCommandLatency: vi.fn(),
  incrementError: vi.fn(),
  setActiveGuilds: vi.fn(),
});

const makeInteraction = (): ChatInputCommandInteraction =>
  ({
    reply: vi.fn().mockResolvedValue(undefined),
    user: { id: '123456789012345678' },
  }) as unknown as ChatInputCommandInteraction;

describe('PingCommand', () => {
  it('replies with Pong!', async () => {
    const cmd = new PingCommand(makeLogger(), makeMetrics());
    const interaction = makeInteraction();

    await cmd.execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith({ content: 'Pong!', ephemeral: true });
  });

  it('records latency metric', async () => {
    const metrics = makeMetrics();
    const cmd = new PingCommand(makeLogger(), metrics);

    await cmd.execute(makeInteraction());

    expect(metrics.recordCommandLatency).toHaveBeenCalledWith('ping', expect.any(Number));
  });
});
