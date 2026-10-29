# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Dependencies (full, for build) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Builder ----
FROM base AS builder
ENV NODE_ENV=production
# Build-only placeholders: never real secrets.
ENV BETTER_AUTH_SECRET=build-only-placeholder-secret-32-characters \
    DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
    BETTER_AUTH_URL=https://example.invalid \
    TRUSTED_ORIGINS=https://example.invalid
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Production dependencies (for migrator) ----
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Migrator target ----
FROM base AS migrator
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY scripts/migrate.mjs ./scripts/migrate.mjs
COPY drizzle ./drizzle
USER node
CMD ["node", "scripts/migrate.mjs"]

# ---- App runner ----
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
