#!/usr/bin/env bash
# postgis/init-app/db00-bootstrap.sh
set -euo pipefail

# Garante defaults do Postgres
: "${POSTGRES_USER:=postgres}"
: "${POSTGRES_PASSWORD:=postgres}"
: "${POSTGRES_DB:=sacir}"

# Variáveis exigidas pelo projeto (falha se ausentes)
: "${POSTGREST_JWT_SECRET:?POSTGREST_JWT_SECRET ausente no ambiente do container}"
: "${POSTGREST_JWT_TTL_SECONDS:=3600}"

readonly POSTGREST_JWT_TTL_SECONDS_ERROR_MESSAGE="FATAL: POSTGREST_JWT_TTL_SECONDS deve ser um inteiro positivo"

if [[ ! "${POSTGREST_JWT_TTL_SECONDS}" =~ ^[0-9]+$ ]]; then
  echo "${POSTGREST_JWT_TTL_SECONDS_ERROR_MESSAGE}" >&2
  exit 1
fi

if [[ "${POSTGREST_JWT_TTL_SECONDS}" -le 0 ]]; then
  echo "${POSTGREST_JWT_TTL_SECONDS_ERROR_MESSAGE}" >&2
  exit 1
fi
: "${PGRST_DB_PASS:?PGRST_DB_PASS ausente no ambiente do container}"

# Variáveis opcionais com defaults
: "${BASIC_AUTH_ADMIN_EMAIL:=admin@sacir.local}"
: "${BASIC_AUTH_ADMIN_PIN:=123456}"   # 6 dígitos
: "${BASIC_AUTH_USER_EMAIL:=usuario@sacir.local}"
: "${BASIC_AUTH_USER_PIN:=654321}"    # 6 dígitos

export PGPASSWORD="${POSTGRES_PASSWORD}"

# Cria o DB-alvo se não existir (idempotente)
psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d postgres \
  -c "DO \$\$BEGIN IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}') THEN EXECUTE 'CREATE DATABASE ${POSTGRES_DB}'; END IF; END\$\$;"

# Aplica o SQL com as variáveis injetadas via -v
psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  -v POSTGREST_JWT_SECRET="${POSTGREST_JWT_SECRET}" \
  -v POSTGREST_JWT_TTL_SECONDS="${POSTGREST_JWT_TTL_SECONDS}" \
  -v PGRST_DB_PASS="${PGRST_DB_PASS}" \
  -v BASIC_AUTH_ADMIN_EMAIL="${BASIC_AUTH_ADMIN_EMAIL}" \
  -v BASIC_AUTH_ADMIN_PIN="${BASIC_AUTH_ADMIN_PIN}" \
  -v BASIC_AUTH_USER_EMAIL="${BASIC_AUTH_USER_EMAIL}" \
  -v BASIC_AUTH_USER_PIN="${BASIC_AUTH_USER_PIN}" \
  -f "/docker-entrypoint-initdb.d/00-bootstrap.psql"
