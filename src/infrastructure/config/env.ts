function require(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = Object.freeze({
  discordToken: require('DISCORD_TOKEN'),
  discordClientId: require('DISCORD_CLIENT_ID'),
  discordGuildId: optional('DISCORD_GUILD_ID', ''),
  databaseUrl: require('DATABASE_URL'),
  logLevel: optional('LOG_LEVEL', 'info'),
  metricsPort: Number(optional('METRICS_PORT', '9090')),
  nodeEnv: optional('NODE_ENV', 'development'),
  isDev: optional('NODE_ENV', 'development') === 'development',
});
