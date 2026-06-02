import { Entity } from '../../shared/index.js';
import type { GuildId } from '../value-objects/guild-id.vo.js';
import type { Prefix } from '../value-objects/prefix.vo.js';

export interface GuildConfigProps {
  guildId: GuildId;
  prefix: Prefix;
  createdAt: Date;
  updatedAt: Date;
}

export class GuildConfig extends Entity<string> {
  private props: GuildConfigProps;

  private constructor(props: GuildConfigProps) {
    super(props.guildId.value);
    this.props = props;
  }

  get guildId(): GuildId {
    return this.props.guildId;
  }
  get prefix(): Prefix {
    return this.props.prefix;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(guildId: GuildId, prefix: Prefix): GuildConfig {
    return new GuildConfig({ guildId, prefix, createdAt: new Date(), updatedAt: new Date() });
  }

  static reconstitute(props: GuildConfigProps): GuildConfig {
    return new GuildConfig(props);
  }

  updatePrefix(prefix: Prefix): void {
    this.props.prefix = prefix;
    this.props.updatedAt = new Date();
  }
}
