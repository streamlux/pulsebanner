FROM node:14.1-alpine as prisma
WORKDIR /app
COPY ./dist/apps/next/package.json .
COPY ./prisma ./prisma
# install prisma to generate client
RUN npm install prisma
RUN npx prisma generate

# Install dependencies only when needed
FROM node:16.3-alpine3.12 AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY ./dist/apps/next/package.json ./
COPY ./patches ./patches
RUN npm install --only=production --legacy-peer-deps
RUN npm i -g patch-package
RUN npx patch-package

# Production image, copy all the files and run next
FROM node:16.3-alpine3.12 AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
# COPY ./dist/apps/next/next.config.js ./
COPY ./dist/apps/next/public ./public
COPY  --chown=nextjs:nodejs ./dist/apps/next/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

CMD ["npm", "run", "start"]
