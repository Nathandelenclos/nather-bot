-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "guild_configs" (
    "guildId" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT '!',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guild_configs_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("userId","guildId")
);

-- CreateTable
CREATE TABLE "command_logs" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commandName" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "command_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "command_logs_guildId_idx" ON "command_logs"("guildId");

-- CreateIndex
CREATE INDEX "command_logs_userId_idx" ON "command_logs"("userId");
