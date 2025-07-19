FROM node:22-slim

WORKDIR /app
COPY package.json .
RUN yarn install
COPY . .
RUN yarn build

RUN yarn prisma generate
RUN yarn prisma migrate deploy
EXPOSE 4000

CMD ["yarn", "start:prod"]