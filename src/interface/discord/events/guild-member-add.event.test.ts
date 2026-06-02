import type { GuildMember, TextChannel } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';
import type { GetGuildConfigUseCase } from '../../../application/guild/use-cases/get-guild-config.use-case.js';
import type { GetOrCreateUserProfileUseCase } from '../../../application/user/use-cases/get-or-create-user-profile.use-case.js';
import { GuildConfig, GuildId, Prefix } from '../../../domain/guild/index.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import { GuildMemberAddEvent } from './guild-member-add.event.js';

const makeLogger = (): ILogger => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

function makeConfig(welcomeChannelId: string | null) {
  const config = GuildConfig.create(
    GuildId.reconstitute('111111111111111111'),
    Prefix.reconstitute('!'),
  );
  if (welcomeChannelId) config.setWelcomeChannel(welcomeChannelId);
  return config;
}

function makeMember(guildId = '111111111111111111'): GuildMember {
  const sendMock = vi.fn().mockResolvedValue(undefined);
  return {
    id: '333333333333333333',
    user: {
      id: '333333333333333333',
      username: 'TestUser',
      displayAvatarURL: vi.fn().mockReturnValue('https://cdn.discordapp.com/avatar.png'),
    },
    guild: {
      id: guildId,
      name: 'Test Guild',
      memberCount: 42,
      channels: {
        cache: {
          get: vi.fn().mockReturnValue({
            isTextBased: () => true,
            send: sendMock,
          } as unknown as TextChannel),
        },
      },
    },
  } as unknown as GuildMember;
}

describe('GuildMemberAddEvent', () => {
  it('sends embed when welcomeChannelId is configured', async () => {
    const getGuildConfig = {
      execute: vi.fn().mockResolvedValue({ ok: true, value: makeConfig('222222222222222222') }),
    } as unknown as GetGuildConfigUseCase;
    const getOrCreateProfile = {
      execute: vi.fn().mockResolvedValue({ ok: true, value: {} }),
    } as unknown as GetOrCreateUserProfileUseCase;
    const event = new GuildMemberAddEvent(getGuildConfig, getOrCreateProfile, makeLogger());
    const member = makeMember();

    await event.execute(member);

    const channel = member.guild.channels.cache.get('222222222222222222') as TextChannel;
    expect(channel.send).toHaveBeenCalledOnce();
    const call = vi.mocked(channel.send).mock.calls[0][0] as {
      embeds: { data: { color: number; footer: { text: string } } }[];
    };
    expect(typeof call.embeds[0].data.color).toBe('number');
    expect(call.embeds[0].data.footer.text).toMatch(/\d{2}\/\d{2}\/\d{4} à \d{2}:\d{2}/);
  });

  it('does not send when no welcomeChannelId configured', async () => {
    const getGuildConfig = {
      execute: vi.fn().mockResolvedValue({ ok: true, value: makeConfig(null) }),
    } as unknown as GetGuildConfigUseCase;
    const getOrCreateProfile = {
      execute: vi.fn().mockResolvedValue({ ok: true, value: {} }),
    } as unknown as GetOrCreateUserProfileUseCase;
    const logger = makeLogger();
    const event = new GuildMemberAddEvent(getGuildConfig, getOrCreateProfile, logger);
    const member = makeMember();

    await event.execute(member);

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('No welcome channel'),
      expect.anything(),
    );
  });

  it('creates UserProfile on member join', async () => {
    const getGuildConfig = {
      execute: vi.fn().mockResolvedValue({ ok: true, value: makeConfig(null) }),
    } as unknown as GetGuildConfigUseCase;
    const getOrCreateProfile = {
      execute: vi.fn().mockResolvedValue({ ok: true, value: {} }),
    } as unknown as GetOrCreateUserProfileUseCase;
    const event = new GuildMemberAddEvent(getGuildConfig, getOrCreateProfile, makeLogger());

    await event.execute(makeMember());

    expect(getOrCreateProfile.execute).toHaveBeenCalledWith({
      userId: '333333333333333333',
      guildId: '111111111111111111',
    });
  });
});
