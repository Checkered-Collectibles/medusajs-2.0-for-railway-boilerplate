# -------------------------------------------------------------------
# Stage 1: Base
# Setup Node 20 + PNPM environment
# -------------------------------------------------------------------
FROM node:20-alpine AS base

# Enable corepack so we can use pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install system dependencies (Required for Medusa/SWC/Sharp)
# Added 'vips-dev' which is critical for Medusa image processing
RUN apk add --no-cache libc6-compat python3 make g++ vips-dev

WORKDIR /app

# -------------------------------------------------------------------
# Stage 2: Dependencies
# Install dependencies
# -------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./

# ⚠️ CRITICAL FIX: Removed '--prod'
# We install ALL deps here so the final image has the libraries needed
# to compile TypeScript files (ts-node) at runtime.
RUN pnpm install --frozen-lockfile

# -------------------------------------------------------------------
# Stage 3: Builder
# Build the application
# -------------------------------------------------------------------
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the project
RUN pnpm build

# -------------------------------------------------------------------
# Stage 4: Runner
# Final production image
# -------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 medusa

# Grant permissions
RUN chown medusa:nodejs /app

USER medusa

# Copy node_modules (Contains ALL deps now, fixing the TS error)
COPY --from=deps --chown=medusa:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=medusa:nodejs /app/.medusa ./.medusa
COPY --from=builder --chown=medusa:nodejs /app/package.json ./package.json
COPY --from=builder --chown=medusa:nodejs /app/medusa-config.js ./medusa-config.js

# ⚠️ CRITICAL FIX: Copy 'src' so config can find modules
COPY --from=builder --chown=medusa:nodejs /app/src ./src

# Copy Entrypoint Script
COPY --chown=medusa:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pnpm", "start"]