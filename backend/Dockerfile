FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
# Install system deps for native modules (sharp, etc.)
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

# [REMOVED] COPY .env .env 
# DigitalOcean builds from Git; .env won't exist there. 
# Medusa builds fine without it (secrets are needed at runtime, not build time).

# Build the project
RUN pnpm build

# [DISABLED] Do not prune. 
# Medusa v2 requires @medusajs/utils (often a devDep) at runtime to load config.
# RUN pnpm prune --prod

# --- Stage 4: Runner ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 medusa

# Copy necessary files
# Note: We copy the FULL node_modules now since we didn't prune
COPY --from=builder --chown=medusa:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=medusa:nodejs /app/package.json ./package.json
COPY --from=builder --chown=medusa:nodejs /app/medusa-config.js ./medusa-config.js
COPY --from=builder --chown=medusa:nodejs /app/.medusa ./.medusa
COPY --chown=medusa:nodejs docker-entrypoint.sh ./docker-entrypoint.sh

# Ensure entrypoint is executable
RUN chmod +x ./docker-entrypoint.sh

USER medusa
EXPOSE 9000

# Entrypoint handles migrations automatically
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pnpm", "start"]