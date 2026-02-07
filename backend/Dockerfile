# ---------- deps ----------
  FROM node:18-alpine AS deps
  WORKDIR /app
  
  RUN apk add --no-cache openssl openssl-dev
  
  COPY package.json package-lock.json ./
  RUN npm ci
  
  # ---------- build ----------
  FROM node:18-alpine AS build
  WORKDIR /app
  
  RUN apk add --no-cache openssl openssl-dev
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  
  RUN npx prisma generate
  RUN npm run build
  
  # ---------- production ----------
  FROM node:18-alpine AS production
  WORKDIR /app
  
  RUN apk add --no-cache curl openssl postgresql-client
  
  RUN addgroup -g 1001 -S nodejs \
   && adduser -S nodejs -u 1001 -G nodejs
  
  ENV NODE_ENV=production
  ENV PORT=3001
  
  # Copy only what runtime needs
  COPY --from=build /app/package.json ./package.json
  COPY --from=build /app/package-lock.json ./package-lock.json
  COPY --from=build /app/node_modules ./node_modules
  COPY --from=build /app/dist ./dist
  COPY --from=build /app/prisma ./prisma
  
  # uploads dir
  RUN mkdir -p /app/uploads \
   && chown -R nodejs:nodejs /app
  
  USER nodejs
  
  EXPOSE 3001
  
  HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1
  
  CMD ["npm","start"]