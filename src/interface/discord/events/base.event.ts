import type { Client, ClientEvents } from 'discord.js';

export interface IDiscordEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  readonly name: K;
  readonly once: boolean;
  execute(...args: ClientEvents[K]): Promise<void>;
}

export function registerEvents(client: Client, events: IDiscordEvent[]): void {
  for (const event of events) {
    const handler = (...args: unknown[]) =>
      (event.execute as (...a: unknown[]) => Promise<void>)(...args);

    if (event.once) {
      client.once(event.name, handler);
    } else {
      client.on(event.name, handler);
    }
  }
}
