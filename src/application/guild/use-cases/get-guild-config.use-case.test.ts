import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IGuildConfigRepository } from '../../../domain/guild/index.js';
import { GuildConfig, GuildId, Prefix } from '../../../domain/guild/index.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import { GetGuildConfigUseCase } from './get-guild-config.use-case.js';

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

describe('GetGuildConfigUseCase', () => {
  let repo: IGuildConfigRepository;
  let logger: ILogger;
  let useCase: GetGuildConfigUseCase;

  beforeEach(() => {
    repo = makeRepo();
    logger = makeLogger();
    useCase = new GetGuildConfigUseCase(repo, logger);
  });

  it('returns existing config', async () => {
    const guildId = GuildId.reconstitute('123456789012345678');
    const config = GuildConfig.create(guildId, Prefix.reconstitute('!'));
    vi.mocked(repo.findByGuildId).mockResolvedValue(config);

    const result = await useCase.execute({ guildId: '123456789012345678' });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(config);
  });

  it('returns default config when not found', async () => {
    vi.mocked(repo.findByGuildId).mockResolvedValue(null);

    const result = await useCase.execute({ guildId: '123456789012345678' });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.prefix.value).toBe('!');
  });

  it('returns error for invalid guildId', async () => {
    const result = await useCase.execute({ guildId: 'not-a-snowflake' });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INVALID_GUILD_ID');
  });
});
