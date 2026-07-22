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
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY packages ./packages
COPY apps/web ./apps/web
RUN pnpm --filter @idfb/web build

# ---- Runtime ----
FROM base AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
