FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Rewrites are resolved at build time, so the API address must be known here.
ARG API_INTERNAL_URL=http://backend:4010
ENV API_INTERNAL_URL=$API_INTERNAL_URL
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3010 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3010
CMD ["node", "server.js"]
