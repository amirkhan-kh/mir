FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY tsconfig.json ./
COPY migrations ./migrations
COPY src ./src
COPY uploads/seed ./seed-images
# Seed images are copied into the uploads volume on first boot.
CMD ["sh", "-c", "mkdir -p uploads && cp -rn seed-images uploads/seed 2>/dev/null; npx tsx src/server.ts"]
EXPOSE 4010
