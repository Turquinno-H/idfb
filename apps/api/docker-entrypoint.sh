#!/bin/sh
set -e

# Applies pending Prisma migrations (and, on first boot, seeds base
# reference data: currencies, permission catalogue, system roles) before
# starting the API. Both steps are idempotent and can be disabled with
# RUN_MIGRATIONS=false / RUN_SEED=false.

# The container regularly starts before the managed database accepts
# connections. A single failed attempt used to abort the entrypoint, which
# killed the container and left the platform serving 502 from a crash loop
# that no amount of waiting recovered from. Retry with a widening delay and
# only give up once the database has had a reasonable chance to come up.
run_with_retry() {
  label=$1
  shift
  attempt=1
  delay=2
  while :; do
    if "$@"; then
      return 0
    fi
    if [ "$attempt" -ge "${STARTUP_MAX_ATTEMPTS:-6}" ]; then
      echo "[entrypoint] $label failed after $attempt attempts"
      return 1
    fi
    echo "[entrypoint] $label failed (attempt $attempt), retrying in ${delay}s..."
    sleep "$delay"
    attempt=$((attempt + 1))
    delay=$((delay * 2))
  done
}

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] applying database migrations..."
  run_with_retry "migration" pnpm --filter @idfb/database exec prisma migrate deploy

  if [ "${RUN_SEED:-true}" = "true" ]; then
    echo "[entrypoint] seeding base data..."
    run_with_retry "seed" pnpm --filter @idfb/database exec prisma db seed ||
      echo "[entrypoint] seed skipped/failed, continuing"
  fi
fi

echo "[entrypoint] starting API..."
exec node apps/api/dist/main.js
