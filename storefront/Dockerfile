# -------------------------------------------------------------------
# Stage 1: Base
# Node 20 + PNPM + system deps for native modules (sharp, etc.)
# -------------------------------------------------------------------
FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate

# Native build deps (some projects need these for sharp/swc during install/build)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app


# -------------------------------------------------------------------
# Stage 2: Dependencies
# Install deps with cache-friendly layer separation
# -------------------------------------------------------------------
FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


# -------------------------------------------------------------------
# Stage 3: Builder
# Build Next.js app (standalone output)
# -------------------------------------------------------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Optional build-time args for public envs (ONLY if needed at build time)
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

RUN pnpm build


# -------------------------------------------------------------------
# Stage 4: Runner
# Minimal runtime image using Next standalone output
# -------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Railway injects PORT; Next standalone server respects PORT
ENV PORT=3000
EXPOSE 3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy only what we need to run
# Standalone server + required node_modules subset are inside .next/standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

# Ensure permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

CMD ["node", "server.js"]