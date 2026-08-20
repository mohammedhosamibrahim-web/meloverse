# MeloVerse web backend — deployment image
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY web/package.json web/package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund
COPY web/ ./
EXPOSE 3000
CMD ["node", "server.js"]
