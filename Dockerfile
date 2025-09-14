FROM oven/bun:latest

RUN apt update -y
RUN apt install -y openssl

WORKDIR /app

# Use a dummy DATABASE_URL for build time (Prisma generate doesn't need to connect)
ENV DATABASE_URL="postgresql://postgres:password@localhost:5432/pocketbook"

COPY package.json bun.lockb* ./
COPY prisma ./prisma/
RUN bun install

RUN bunx prisma generate

COPY . .

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Build without running migrations (override prebuild script)
RUN bunx prisma generate && bunx next build

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="postgresql://postgres:password@postgres:5432/pocketbook"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["bun", ".next/standalone/server.js"]
