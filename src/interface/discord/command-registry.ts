import type { IDiscordCommand } from './commands/base.command.js';

export class CommandRegistry {
  private readonly commands = new Map<string, IDiscordCommand>();

  register(command: IDiscordCommand): void {
    this.commands.set(command.data.name, command);
  }

  get(name: string): IDiscordCommand | undefined {
    return this.commands.get(name);
  }

  all(): IDiscordCommand[] {
    return [...this.commands.values()];
  }
}
