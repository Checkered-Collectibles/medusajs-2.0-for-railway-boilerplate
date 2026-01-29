# -------------------------------------------------------------------
# Stage 1: Base
# Setup Node 20 + PNPM environment
# -------------------------------------------------------------------
FROM node:20-alpine AS base

# Enable corepack to use pnpm without installing it manually
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install libc6-compat for compatibility with native modules (SWC, Sharp, etc.)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# -------------------------------------------------------------------
# Stage 2: Dependencies
# Install production dependencies only
# -------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# Install only production deps to keep image small
RUN pnpm install --prod --frozen-lockfile

# -------------------------------------------------------------------
# Stage 3: Builder
# Install dev dependencies and build the application
# -------------------------------------------------------------------
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
# Install ALL deps (including devDeps) so we can build
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Run the build script (medusa build && node src/scripts/postBuild.js)
RUN pnpm build

# -------------------------------------------------------------------
# Stage 4: Runner
# Final production image
# -------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 medusa
USER medusa

# Copy production node_modules from deps stage
COPY --from=deps --chown=medusa:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
# Medusa 2.0 builds into .medusa/server
COPY --from=builder --chown=medusa:nodejs /app/.medusa ./.medusa
COPY --from=builder --chown=medusa:nodejs /app/package.json ./package.json
COPY --from=builder --chown=medusa:nodejs /app/medusa-config.js ./medusa-config.js

# Copy source scripts if 'init-backend' or post-build scripts rely on them at runtime
COPY --from=builder --chown=medusa:nodejs /app/src/scripts ./src/scripts

# Expose the Medusa port (default is 9000)
EXPOSE 9000

# Use the 'start' script from package.json
# This ensures 'init-backend' runs before the server starts
CMD ["pnpm", "start"]