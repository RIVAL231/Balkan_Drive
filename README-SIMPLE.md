# 🚀 Balkan Drive - Simple Docker Setup

A complete file storage application with PostgreSQL database, Go backend, and React frontend - all in Docker.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🏃‍♂️ Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd Balkan_Drive
   ```

2. **Start the entire application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - **Frontend:** http://localhost:3001
   - **Backend API:** http://localhost:8080/query
   - **GraphQL Playground:** http://localhost:8080/

## ⚙️ Configuration

The backend uses the `.env` file located in `backend/.env` which is automatically copied into the Docker image. Key settings include:

- **Database:** PostgreSQL (automatically created)
- **AWS S3:** File storage (configure your credentials in the .env file)
- **Authentication:** JWT-based

## 🛠️ Management Commands

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

## 🔧 Development

For development with hot reload, you can mount the source code:

```bash
# Edit docker-compose.yml to add volumes for development:
# backend:
#   volumes:
#     - ./backend:/app
# frontend:  
#   volumes:
#     - ./frontend:/app
```

## 📊 Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React web application |
| Backend | 8080 | GraphQL API server |
| Database | 5432 | PostgreSQL database |

## 🔒 Production Notes

- Change JWT_SECRET in production
- Set proper AWS credentials
- Use environment variables for sensitive data
- Consider using Docker secrets for production deployments

## 🐛 Troubleshooting

**Database Connection Issues:**
```bash
# Check if database is ready
docker-compose logs database
```

**Build Issues:**
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**S3 Issues:**
- Verify AWS credentials in `backend/.env`
- Ensure S3 bucket exists and is accessible