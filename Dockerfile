# syntax=docker/dockerfile:1
# ---------- 1. deps ----------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- 2. build ----------
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Clerk publishable key di-inline saat build (NEXT_PUBLIC_*), jadi harus tersedia di sini.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate && npm run build

# ---------- 3. runner ----------
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV UPLOAD_DIR=/app/uploads

# Pakai user `node` bawaan image (uid 1000, gid 1000) — sengaja disamakan dengan
# user `alex` di T480 supaya bind mount ./uploads bisa ditulis tanpa perlu root/chown.

# Output standalone: server + node_modules minimal
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Prisma CLI + schema untuk menjalankan `migrate deploy` saat container start
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Sengaja TIDAK menyalin node_modules/.bin/prisma: itu symlink, dan menyalinnya
# membuat CLI berjalan dari dalam .bin/ sehingga gagal menemukan file .wasm-nya.
# Entrypoint memanggil build/index.js langsung.

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
 && mkdir -p /app/uploads && chown -R node:node /app/uploads

USER node
EXPOSE 3000
VOLUME ["/app/uploads"]

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
