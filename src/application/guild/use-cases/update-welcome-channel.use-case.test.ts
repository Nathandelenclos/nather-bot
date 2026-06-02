import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IGuildConfigRepository } from '../../../domain/guild/index.js';
import { GuildConfig, GuildId, Prefix } from '../../../domain/guild/index.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import { UpdateWelcomeChannelUseCase } from './update-welcome-channel.use-case.js';

const makeLogger = (): ILogger => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

const makeRepo = (): IGuildConfigRepository => ({
  findByGuildId: vi.fn(),
  upsert: vi.fn(),
});

const GUILD_ID = '111111111111111111';
const CHANNEL_ID = '222222222222222222';

describe('UpdateWelcomeChannelUseCase', () => {
  let repo: IGuildConfigRepository;
  let logger: ILogger;
  let useCase: UpdateWelcomeChannelUseCase;

  beforeEach(() => {
    repo = makeRepo();
    logger = makeLogger();
    useCase = new UpdateWelcomeChannelUseCase(repo, logger);
  });

  it('stores channelId on existing GuildConfig', async () => {
    const config = GuildConfig.create(GuildId.reconstitute(GUILD_ID), Prefix.reconstitute('!'));
    vi.mocked(repo.findByGuildId).mockResolvedValue(config);
    vi.mocked(repo.upsert).mockResolvedValue(config);

    const result = await useCase.execute({ guildId: GUILD_ID, channelId: CHANNEL_ID });

    expect(result.ok).toBe(true);
    expect(repo.upsert).toHaveBeenCalledOnce();
  });

  it('creates GuildConfig when none exists and sets channelId', async () => {
    vi.mocked(repo.findByGuildId).mockResolvedValue(null);
    const upserted = GuildConfig.create(GuildId.reconstitute(GUILD_ID), Prefix.reconstitute('!'));
    vi.mocked(repo.upsert).mockResolvedValue(upserted);

    const result = await useCase.execute({ guildId: GUILD_ID, channelId: CHANNEL_ID });

    expect(result.ok).toBe(true);
    expect(repo.upsert).toHaveBeenCalledOnce();
  });

  it('returns error for invalid guildId', async () => {
    const result = await useCase.execute({ guildId: 'bad-id', channelId: CHANNEL_ID });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INVALID_GUILD_ID');
  });

  it('allows null channelId to remove welcome channel', async () => {
    const config = GuildConfig.create(GuildId.reconstitute(GUILD_ID), Prefix.reconstitute('!'));
    vi.mocked(repo.findByGuildId).mockResolvedValue(config);
    vi.mocked(repo.upsert).mockResolvedValue(config);

    const result = await useCase.execute({ guildId: GUILD_ID, channelId: null });

    expect(result.ok).toBe(true);
  });
});
