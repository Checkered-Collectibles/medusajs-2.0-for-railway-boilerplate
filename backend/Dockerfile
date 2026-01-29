FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat python3 make g++ vips-dev

WORKDIR /app

# --- Stage 2: Dependencies ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Stage 3: Builder ---
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# [NEW] Copy .env so the build process can see it
COPY .env .env 

# Build the project
RUN pnpm build
RUN pnpm prune --prod

# --- Stage 4: Runner ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 medusa

COPY --from=builder --chown=medusa:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=medusa:nodejs /app/package.json ./package.json
COPY --from=builder --chown=medusa:nodejs /app/medusa-config.js ./medusa-config.js
COPY --from=builder --chown=medusa:nodejs /app/.medusa ./.medusa
COPY --chown=medusa:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Note: We do NOT copy .env here. We rely on passing it at runtime.

USER medusa
EXPOSE 9000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pnpm", "start"]