FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY prisma ./prisma
RUN pnpm db:generate

COPY tsconfig*.json ./
COPY src ./src
RUN pnpm build

# ---

FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY prisma ./prisma

ENV NODE_ENV=production

CMD ["sh", "-c", "node dist/main.js"]
