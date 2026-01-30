# 1. Use Debian Slim (Matches Railway's OS type)
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate

# 2. Install library Railway explicitly uses (libatomic1) + openssl/python for builds
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libatomic1 \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# 3. SAFETY CHECK: Remove '--prod' temporarily to see if it fixes the missing plugin
# Once fixed, you can add '--prod' back.
RUN pnpm install --frozen-lockfile

# Stage 3: Builder
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 4: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create user
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 medusa

RUN chown medusa:nodejs /app
USER medusa

# Copy modules
COPY --from=deps --chown=medusa:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=medusa:nodejs /app/.medusa ./.medusa
COPY --from=builder --chown=medusa:nodejs /app/package.json ./package.json
COPY --from=builder --chown=medusa:nodejs /app/medusa-config.js ./medusa-config.js
COPY --from=builder --chown=medusa:nodejs /app/src/scripts ./src/scripts

EXPOSE 9000
CMD ["pnpm", "start"]