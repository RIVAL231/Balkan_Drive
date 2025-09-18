#!/bin/bash

# Balkan Drive - Simple Startup Script

echo "🚀 Starting Balkan Drive Application..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose first."
    exit 1
fi

echo "🏭 Starting Balkan Drive..."
docker compose up --build -d

echo ""
echo "✅ Balkan Drive is starting up!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080/query"
echo "   Database: localhost:5432"
echo ""
echo "📊 To view logs: docker compose logs -f"
echo "🛑 To stop: docker compose down"
echo ""
echo "⏳ Please wait a moment for all services to be ready..."