import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) {
    console.log('DISCORD_GUILD_ID not set, skipping seed.');
    return;
  }

  await prisma.guildConfig.upsert({
    where: { guildId },
    update: {},
    create: { guildId, prefix: '!' },
  });

  console.log(`Seeded GuildConfig for guild ${guildId}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
