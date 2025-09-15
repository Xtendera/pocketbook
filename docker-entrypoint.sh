#!/bin/sh
set -e

echo "Setting up database..."

# First, try to run migrations normally
if bunx prisma migrate deploy 2>/dev/null; then
    echo "Migrations applied successfully"
else
    echo "Migration deploy failed, checking status..."
    
    # If deploy fails, check the migration status
    bunx prisma migrate status
    
    echo "Attempting to resolve migration state..."
    
    # Try to mark existing migrations as applied (resolve drift)
    bunx prisma migrate resolve --applied || true
    
    # Then try to deploy again
    bunx prisma migrate deploy
fi

echo "Running database seed..."
bun prisma/seed.ts || echo "Seeding completed or failed"

echo "Starting the application..."
exec "$@"
