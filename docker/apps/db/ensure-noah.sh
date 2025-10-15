#!/bin/bash
set -euo pipefail

ORIGINAL_ENTRYPOINT="/usr/local/bin/docker-entrypoint.sh"

if [ ! -x "$ORIGINAL_ENTRYPOINT" ]; then
  echo "Expected postgres entrypoint at $ORIGINAL_ENTRYPOINT" >&2
  exit 1
fi

NOAH_USER=${POSTGRES_USER:-noah}
NOAH_PASSWORD=${POSTGRES_PASSWORD:-}
NOAH_DB=${POSTGRES_DB:-$NOAH_USER}

if [ -s "$PGDATA/PG_VERSION" ]; then
  echo "Ensuring role '$NOAH_USER' exists in existing database cluster..."

  SQL_STATEMENTS="DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = '${NOAH_USER}') THEN
    CREATE ROLE ${NOAH_USER} LOGIN PASSWORD '${NOAH_PASSWORD}';
  ELSE
    ALTER ROLE ${NOAH_USER} WITH LOGIN PASSWORD '${NOAH_PASSWORD}';
  END IF;
END;
$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${NOAH_DB}') THEN
    CREATE DATABASE ${NOAH_DB};
  END IF;
  ALTER DATABASE ${NOAH_DB} OWNER TO ${NOAH_USER};
END;
$$;"

  if [ -z "$NOAH_PASSWORD" ]; then
    SQL_STATEMENTS="DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = '${NOAH_USER}') THEN
    CREATE ROLE ${NOAH_USER} LOGIN;
  END IF;
END;
$$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${NOAH_DB}') THEN
    CREATE DATABASE ${NOAH_DB};
  END IF;
  ALTER DATABASE ${NOAH_DB} OWNER TO ${NOAH_USER};
END;
$$;"
  fi

  echo "$SQL_STATEMENTS" | gosu postgres postgres --single -D "$PGDATA" postgres >/dev/null
fi

exec "$ORIGINAL_ENTRYPOINT" "$@"
