# Balkan Drive - Docker Management Makefile

.PHONY: help build up down restart logs clean dev prod health backup restore

# Default target
help:
	@echo "🚀 Balkan Drive - Docker Management"
	@echo ""
	@echo "Available commands:"
	@echo "  make up          - Start all services in production mode"
	@echo "  make dev         - Start all services in development mode"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make build       - Build all images"
	@echo "  make logs        - Show logs from all services"
	@echo "  make health      - Check health of all services"
	@echo "  make clean       - Clean up everything (⚠️  removes all data)"
	@echo "  make backup      - Backup database"
	@echo "  make restore     - Restore database from backup"
	@echo ""

# Production mode
up prod:
	@echo "🏭 Starting Balkan Drive in production mode..."
	docker-compose up -d --build

# Development mode
dev:
	@echo "🛠️  Starting Balkan Drive in development mode..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Stop services
down:
	@echo "🛑 Stopping Balkan Drive..."
	docker-compose down

# Restart services
restart:
	@echo "🔄 Restarting Balkan Drive..."
	docker-compose restart

# Build images
build:
	@echo "🔨 Building all images..."
	docker-compose build --no-cache

# Show logs
logs:
	@echo "📊 Showing logs..."
	docker-compose logs -f

# Health check
health:
	@echo "🏥 Checking service health..."
	@echo "Frontend:"
	@curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000 || echo "❌ Frontend not responding"
	@echo "Backend:"
	@curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/health || echo "❌ Backend not responding"
	@echo "Database:"
	@docker-compose exec -T database pg_isready -U admin -d graphqlmvp || echo "❌ Database not responding"

# Clean everything
clean:
	@echo "🧹 Cleaning up everything..."
	@read -p "⚠️  This will remove ALL data. Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v --rmi all
	docker system prune -a -f
	docker volume prune -f

# Backup database
backup:
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	docker-compose exec -T database pg_dump -U admin graphqlmvp > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created in backups/ directory"

# Restore database
restore:
	@echo "📥 Restoring database..."
	@ls -la backups/
	@read -p "Enter backup file name: " file && \
	docker-compose exec -T database psql -U admin graphqlmvp < backups/$$file
	@echo "✅ Database restored"

# Quick status
status:
	@echo "📋 Service Status:"
	docker-compose ps