FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

# Build-time env vars (needed by Astro for PUBLIC_* vars)
ARG PUBLIC_BASE_URL
ARG HCA_CLIENT_ID
ARG HCA_CLIENT_SECRET
ARG SESSION_SECRET

RUN bun run build

FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

CMD ["bun", "./dist/server/entry.mjs"]
