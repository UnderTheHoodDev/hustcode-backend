# ---------- Build stage ----------
FROM node:22-slim AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate

RUN yarn build

# ---------- Runtime stage ----------
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 4000
CMD ["yarn", "start:prod"]
