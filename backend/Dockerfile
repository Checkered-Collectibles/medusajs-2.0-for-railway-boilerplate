# -------------------------------------------------------------------
# Stage 1: Base
# Setup Node 20 + PNPM environment
# -------------------------------------------------------------------
FROM node:20-alpine AS base

# Enable corepack so we can use pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# RUN corepack enable
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate

# Install system dependencies (required for Medusa/SWC/Sharp)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# -------------------------------------------------------------------
# Stage 2: Dependencies
# Install production dependencies only
# -------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# Install only production deps
RUN pnpm install --prod --frozen-lockfile

# -------------------------------------------------------------------
# Stage 3: Builder
# Install all deps and build the application
# -------------------------------------------------------------------
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
# Install ALL deps (including devDeps)
RUN pnpm install --frozen-lockfile

# Copy source code
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

# === PERMISSION FIX ===
# Grant medusa user ownership of /app so 'init-backend' can write .env
RUN chown medusa:nodejs /app

USER medusa

# Copy production node_modules from deps stage
COPY --from=deps --chown=medusa:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=medusa:nodejs /app/.medusa ./.medusa
COPY --from=builder --chown=medusa:nodejs /app/package.json ./package.json
COPY --from=builder --chown=medusa:nodejs /app/medusa-config.js ./medusa-config.js

# Copy scripts folder
COPY --from=builder --chown=medusa:nodejs /app/src/scripts ./src/scripts

EXPOSE 9000

CMD ["pnpm", "start"]