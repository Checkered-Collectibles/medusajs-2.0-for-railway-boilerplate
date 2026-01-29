# -------------------------------------------------------------------
# Stage 1: Base
# Setup Node 20 + PNPM + System Deps
# -------------------------------------------------------------------
FROM node:20-alpine AS base

# Install libc6-compat (required for Next.js process management in Alpine)
RUN apk add --no-cache libc6-compat

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# -------------------------------------------------------------------
# Stage 2: Deps
# Install dependencies (cached)
# -------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# -------------------------------------------------------------------
# Stage 3: Builder
# Build the application
# -------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# ARG allows you to pass env vars during build if needed
# (Next.js bakes NEXT_PUBLIC_ vars into the code at build time)
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=${NEXT_PUBLIC_MEDUSA_BACKEND_URL}

# Run the build
# If this fails with "Module not found", it is 100% a file casing issue
RUN pnpm build

# -------------------------------------------------------------------
# Stage 4: Runner
# Final production image
# -------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder (for static assets like images/favicon)
COPY --from=builder /app/public ./public

# Copy the standalone build output
# Next.js "standalone" creates a minimal server.js file
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]