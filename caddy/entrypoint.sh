#!/bin/bash
# caddy/entrypoint.sh

set -euo pipefail

DEFAULT_DOMAIN="brickbreacker.cranio.dev"
DEFAULT_UPSTREAM="http://brickbreaker:7979"
DEFAULT_ACME_EMAIL="infra@cranio.dev"

export CADDY_DOMAIN="${CADDY_DOMAIN:-${DEFAULT_DOMAIN}}"
export CADDY_UPSTREAM="${CADDY_UPSTREAM:-${DEFAULT_UPSTREAM}}"
export ACME_EMAIL="${ACME_EMAIL:-${DEFAULT_ACME_EMAIL}}"

mkdir -p /data /config

printf "🌐 Iniciando Caddy para %s redirecionando para %s\n" "${CADDY_DOMAIN}" "${CADDY_UPSTREAM}"

exec "$@"
