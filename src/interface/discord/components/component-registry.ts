import type { AnySelectMenuInteraction, ButtonInteraction } from 'discord.js';

export interface IComponentHandler {
  readonly customId: string;
  execute(interaction: AnySelectMenuInteraction | ButtonInteraction): Promise<void>;
}

export class ComponentRegistry {
  private readonly handlers = new Map<string, IComponentHandler>();

  register(handler: IComponentHandler): void {
    this.handlers.set(handler.customId, handler);
  }

  get(customId: string): IComponentHandler | undefined {
    return this.handlers.get(customId);
  }
}
