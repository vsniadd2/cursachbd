#!/bin/sh
set -e
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Seeding database (idempotent)..."
npm run db:seed
exec "$@"
