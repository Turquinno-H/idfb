#!/bin/sh
set -e

# Applies pending Prisma migrations (and, on first boot, seeds base
# reference data: currencies, permission catalogue, system roles) before
# starting the API. Both steps are idempotent and can be disabled with
# RUN_MIGRATIONS=false / RUN_SEED=false.

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] applying database migrations..."
  pnpm --filter @idfb/database exec prisma migrate deploy

  if [ "${RUN_SEED:-true}" = "true" ]; then
    echo "[entrypoint] seeding base data..."
    pnpm --filter @idfb/database exec prisma db seed || echo "[entrypoint] seed skipped/failed, continuing"
  fi
fi

echo "[entrypoint] starting API..."
exec node apps/api/dist/main.js
