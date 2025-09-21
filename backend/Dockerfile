# Build stage
FROM golang:tip-alpine3.22 AS builder

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates tzdata

# Create app directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o backend .

# Final stage
FROM alpine:latest

# Install ca-certificates, curl, postgresql-client and migrate tool
RUN apk --no-cache add ca-certificates curl postgresql-client && \
    wget -O migrate.tar.gz https://github.com/golang-migrate/migrate/releases/download/v4.16.2/migrate.linux-amd64.tar.gz && \
    tar -xzf migrate.tar.gz && \
    mv migrate /usr/local/bin/ && \
    rm migrate.tar.gz

WORKDIR /root/

# Copy the binary, migrations, public directory and .env file from builder stage
COPY --from=builder /app/backend .
COPY --from=builder /app/internal/migrations ./internal/migrations
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env ./.env

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Run the application with inline migration and startup
CMD ["/bin/sh", "-c", "echo 'Starting Balkan Drive Backend...' && echo ' Waiting for database to be ready...' && while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do echo '   Database not ready, waiting...' && sleep 2; done && echo '✅ Database is ready!' && echo '🔍 Checking migration status...' && DB_URL=\"postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=$DB_SSLMODE\" && CURRENT_VERSION=$(migrate -path ./internal/migrations -database \"$DB_URL\" version 2>/dev/null || echo 'none') && echo \"📊 Current migration version: $CURRENT_VERSION\" && if echo \"$CURRENT_VERSION\" | grep -q 'dirty'; then echo '🚨 Database is in dirty state, fixing...' && DIRTY_VERSION=$(echo \"$CURRENT_VERSION\" | grep -o '[0-9]*' | head -1) && echo \"   Forcing version to: $DIRTY_VERSION\" && migrate -path ./internal/migrations -database \"$DB_URL\" force $DIRTY_VERSION && echo '✅ Database state cleaned'; fi && echo '🚀 Running database migrations...' && migrate -path ./internal/migrations -database \"$DB_URL\" up && echo '✅ Migrations completed successfully' && echo '🎯 Starting application server...' && exec ./backend"]