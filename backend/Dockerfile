FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci --only=production && cache clean --force

FROM node:18-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl openssl-dev
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:18-alpine AS production
WORKDIR /app


RUN apk add --no-cache curl openssl postgresql-client

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

RUN mkdir -p /app/uplaods && chown -R nodejs:nodejs /app/uplaods

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

    
CMD [ "npm" , "start" ]
