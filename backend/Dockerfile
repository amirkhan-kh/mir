FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY tsconfig.json ./
COPY migrations ./migrations
COPY public ./public
COPY src ./src
CMD ["sh", "-c", "mkdir -p uploads && npx tsx src/server.ts"]
EXPOSE 4010
