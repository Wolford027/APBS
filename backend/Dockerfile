FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8800
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./

EXPOSE 8800

CMD ["node", "server.js"]
