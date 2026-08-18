# MeloVerse web backend - deployment image
FROM node:20

WORKDIR /app

# ننزل الادوات اللي better-sqlite3 محتاجاها
RUN apt-get update && apt-get install -y python3 make g++

# ننقل الباكدج ونسطب
COPY web/package*.json ./web/
RUN cd web && npm install --no-audit --no-fund

# ننقل باقي الكود
COPY web ./web

WORKDIR /app/web

EXPOSE 10000

CMD ["node", "server.js"]
