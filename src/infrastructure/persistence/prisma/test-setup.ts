import { execSync } from 'node:child_process';

export async function setup() {
  execSync('docker compose -f docker-compose.test.yml up -d --wait', { stdio: 'inherit' });
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/discord_bot_test';
  execSync('pnpm db:migrate:deploy', { stdio: 'inherit', env: process.env });
}

export async function teardown() {
  execSync('docker compose -f docker-compose.test.yml down', { stdio: 'inherit' });
}
