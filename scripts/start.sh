#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if [ ! -f .env ]; then
  node --input-type=module -e 'import fs from "node:fs"; import crypto from "node:crypto"; fs.writeFileSync(".env",fs.readFileSync(".env.example","utf8").replace("change-me-to-a-long-random-secret-min-16-chars",crypto.randomBytes(32).toString("hex")))'
fi
if ! docker info >/dev/null 2>&1; then
  echo 'Запустите Docker Desktop и повторите команду. / Start Docker Desktop first.' >&2
  exit 1
fi
docker compose up -d --build
if [ ! -d frontend/node_modules ]; then
  (cd frontend && npm ci)
fi
cd frontend
exec npm run dev -- --host 127.0.0.1
