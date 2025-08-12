FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --ci

COPY src ./src
ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "start"]
