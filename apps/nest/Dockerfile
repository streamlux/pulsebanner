# generate prisma client
FROM node:14.1-alpine as prisma

WORKDIR /app

COPY ./dist/apps/nest/package.json .

COPY ./prisma ./prisma

# install prisma to generate client
RUN npm install prisma

RUN npx prisma generate


FROM node:16.3-alpine3.12 AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# copy package.json
COPY ./dist/apps/nest/package.json ./

# install production dependencies
RUN npm install --only=production --legacy-peer-deps

# Production image, copy all the files and run nestjs server
FROM node:16.3-alpine3.12 AS runner

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

COPY  --chown=nestjs:nodejs ./dist/apps/nest ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma

USER nestjs

EXPOSE 3333

CMD ["node", "main.js"]
