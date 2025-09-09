FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl openssl-dev
COPY package*.json ./

FROM base AS deps
RUN npm ci --only=production && npm cache clean --force


FROM base AS builder
RUN npm ci
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build



FROM node:18-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD curl -f http://localhost:3000 || exit 1

CMD [ "node", "server.js" ]