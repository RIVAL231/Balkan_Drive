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

# Copy the binary, migrations, startup script and .env file from builder stage
COPY --from=builder /app/backend .
COPY --from=builder /app/internal/migrations ./internal/migrations
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/start.sh ./start.sh

# Make startup script executable
RUN chmod +x ./start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Run the application with startup script
CMD ["./start.sh"]