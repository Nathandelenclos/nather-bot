import { EmbedBuilder, type GuildMember } from 'discord.js';
import type { GetGuildConfigUseCase } from '../../../application/guild/use-cases/get-guild-config.use-case.js';
import type { GetOrCreateUserProfileUseCase } from '../../../application/user/use-cases/get-or-create-user-profile.use-case.js';
import type { ILogger } from '../../../domain/ports/logger.port.js';
import type { IDiscordEvent } from './base.event.js';

export class GuildMemberAddEvent implements IDiscordEvent<'guildMemberAdd'> {
  readonly name = 'guildMemberAdd' as const;
  readonly once = false;

  constructor(
    private readonly getGuildConfig: GetGuildConfigUseCase,
    private readonly getOrCreateUserProfile: GetOrCreateUserProfileUseCase,
    private readonly logger: ILogger,
  ) {}

  async execute(member: GuildMember): Promise<void> {
    // Toujours créer le profil
    void this.getOrCreateUserProfile.execute({
      userId: member.id,
      guildId: member.guild.id,
    });

    const configResult = await this.getGuildConfig.execute({ guildId: member.guild.id });
    if (!configResult.ok || !configResult.value.welcomeChannelId) {
      this.logger.info('No welcome channel configured for guild', { guildId: member.guild.id });
      return;
    }

    const channelId = configResult.value.welcomeChannelId;
    const channel = member.guild.channels.cache.get(channelId);

    if (!channel?.isTextBased()) {
      this.logger.warn('Welcome channel not found or not text-based', { channelId });
      return;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const footerText = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} à ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const color = Math.floor(Math.random() * 0xffffff);

    const embed = new EmbedBuilder()
      .setTitle(`Bienvenue sur ${member.guild.name} ! 🎉`)
      .setDescription(
        `Heureux de t'accueillir, ${member.user} !\nTu es le **${member.guild.memberCount}ème** membre.`,
      )
      .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
      .setColor(color)
      .setFooter({ text: footerText });

    try {
      await channel.send({ embeds: [embed] });
    } catch (err) {
      this.logger.warn('Cannot send welcome message', { channelId, err: String(err) });
    }
  }
}
