
# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Needed by some packages on alpine
RUN apk add --no-cache libc6-compat

# Copy lockfiles first for better caching
COPY package.json ./
COPY package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install deps based on whichever lockfile you use
RUN \
    if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm ci; \
    fi

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# IMPORTANT: Ensure Next builds standalone output (see next.config.js note below)
ENV NEXT_TELEMETRY_DISABLED=1

RUN \
    if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm run build; \
    elif [ -f yarn.lock ]; then yarn build; \
    else npm run build; \
    fi

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Railway sets PORT automatically; Next listens on 3000 by default.
ENV PORT=3000
EXPOSE 3000

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy standalone output (small runtime image)
# This requires next.config.js -> output: "standalone"
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

# Standalone server entry
CMD ["node", "server.js"]