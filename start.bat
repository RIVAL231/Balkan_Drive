@echo off
echo 🚀 Starting Balkan Drive Application...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo 🏭 Starting Balkan Drive...
docker compose up --build -d

echo.
echo ✅ Balkan Drive is starting up!
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8080/query
echo    Database: localhost:5432
echo.
echo 📊 To view logs: docker compose logs -f
echo 🛑 To stop: docker compose down
echo.
echo ⏳ Please wait a moment for all services to be ready...
pause