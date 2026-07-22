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
RUN pnpm --filter @idfb/api --prod deploy /app/deploy

# ---- Runtime ----
FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/deploy/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/packages/database/generated ./node_modules/@idfb/database/generated
COPY --from=build /app/packages/database/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
