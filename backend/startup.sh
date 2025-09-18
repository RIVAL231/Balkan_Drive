#!/bin/bash

echo "🔄 Starting Balkan Drive Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  echo "   Database not ready, waiting..."
  sleep 2
done
echo "✅ Database is ready!"

# Check migration status and fix if dirty
echo "🔍 Checking migration status..."
DB_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=$DB_SSLMODE"

# Get current migration version
CURRENT_VERSION=$(migrate -path ./internal/migrations -database "$DB_URL" version 2>/dev/null || echo "none")
echo "📊 Current migration version: $CURRENT_VERSION"

# Check if database is dirty (contains "dirty" in output)
if echo "$CURRENT_VERSION" | grep -q "dirty"; then
  echo "🚨 Database is in dirty state, fixing..."
  
  # Extract the version number (before "dirty")
  DIRTY_VERSION=$(echo "$CURRENT_VERSION" | grep -o '[0-9]*' | head -1)
  echo "   Forcing version to: $DIRTY_VERSION"
  
  # Force the version to clean the dirty state
  migrate -path ./internal/migrations -database "$DB_URL" force $DIRTY_VERSION
  
  if [ $? -eq 0 ]; then
    echo "✅ Database state cleaned"
  else
    echo "❌ Failed to clean database state"
    exit 1
  fi
fi

# Run migrations
echo "🚀 Running database migrations..."
migrate -path ./internal/migrations -database "$DB_URL" up

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migration failed"
  exit 1
fi

# Start the application
echo "🎯 Starting application server..."
exec ./backend