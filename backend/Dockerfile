FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma
RUN npm install
COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
