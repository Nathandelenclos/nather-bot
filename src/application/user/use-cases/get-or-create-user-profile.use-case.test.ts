import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GuildId } from '../../../domain/guild/value-objects/guild-id.vo.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import type { IUserProfileRepository } from '../../../domain/user/index.js';
import { UserId, UserProfile } from '../../../domain/user/index.js';
import { GetOrCreateUserProfileUseCase } from './get-or-create-user-profile.use-case.js';

const makeLogger = (): ILogger => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

const makeRepo = (): IUserProfileRepository => ({
  findByUserAndGuild: vi.fn(),
  upsert: vi.fn(),
});

const userId = '123456789012345678';
const guildId = '987654321012345678';

describe('GetOrCreateUserProfileUseCase', () => {
  let repo: IUserProfileRepository;
  let logger: ILogger;
  let useCase: GetOrCreateUserProfileUseCase;

  beforeEach(() => {
    repo = makeRepo();
    logger = makeLogger();
    useCase = new GetOrCreateUserProfileUseCase(repo, logger);
  });

  it('returns existing profile', async () => {
    const profile = UserProfile.create(UserId.reconstitute(userId), GuildId.reconstitute(guildId));
    vi.mocked(repo.findByUserAndGuild).mockResolvedValue(profile);

    const result = await useCase.execute({ userId, guildId });

    expect(result.ok).toBe(true);
    expect(repo.upsert).not.toHaveBeenCalled();
  });

  it('creates and saves new profile when not found', async () => {
    const newProfile = UserProfile.create(
      UserId.reconstitute(userId),
      GuildId.reconstitute(guildId),
    );
    vi.mocked(repo.findByUserAndGuild).mockResolvedValue(null);
    vi.mocked(repo.upsert).mockResolvedValue(newProfile);

    const result = await useCase.execute({ userId, guildId });

    expect(result.ok).toBe(true);
    expect(repo.upsert).toHaveBeenCalledOnce();
    if (result.ok) expect(result.value.points.value).toBe(0);
  });
});
