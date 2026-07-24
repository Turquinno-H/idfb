# ---- Base ----
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json tsconfig.base.json ./
COPY packages/database/package.json ./packages/database/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS build
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm --filter @idfb/database exec prisma generate
RUN pnpm --filter @idfb/api build

# ---- Runtime ----
# Reuses the build stage so the Prisma CLI, migrations and seed runner are
# available for the startup entrypoint (migrate + seed) on any host.
FROM build AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY apps/api/docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
EXPOSE 3001
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
