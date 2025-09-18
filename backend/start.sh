#!/bin/sh

# Startup script for backend with automatic migrations

echo "🚀 Starting Balkan Drive Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
  echo "Database not ready yet. Waiting..."
  sleep 2
done
echo "✅ Database is ready!"

# Run migrations
echo "🔄 Running database migrations..."
if command -v migrate >/dev/null 2>&1; then
    migrate -path ./internal/migrations -database "postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=$DB_SSLMODE" up
    if [ $? -eq 0 ]; then
        echo "✅ Migrations completed successfully"
    else
        echo "❌ Migration failed"
        exit 1
    fi
else
    echo "⚠️  migrate tool not available, skipping migrations"
fi

# Start the backend server
echo "🚀 Starting backend server..."
exec ./backend