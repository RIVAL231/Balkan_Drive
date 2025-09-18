# 🚀 Balkan Drive - Dockerized Deployment

A complete file storage and sharing application with GraphQL API, React frontend, and PostgreSQL database, all containerized with Docker.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- 4GB RAM minimum
- 10GB disk space

## 🏃‍♂️ Quick Start

### Option 1: Using Start Scripts

**Windows:**
```cmd
start.bat
```

**Linux/macOS:**
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Docker Compose

**Production Mode:**
```bash
docker-compose up --build -d
```

**Development Mode:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React web application |
| Backend API | http://localhost:8080/query | GraphQL API endpoint |
| Database | localhost:5432 | PostgreSQL database |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │    Database     │
│   (React/TS)    │────│   (Go/GraphQL)  │────│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🐳 Services

### 🗄️ Database (PostgreSQL)
- **Image**: postgres:14-alpine
- **Port**: 5432
- **Credentials**: admin/admin
- **Database**: graphqlmvp
- **Persistent Storage**: Docker volume

### 🔧 Backend (Go + GraphQL)
- **Build**: Custom Dockerfile
- **Port**: 8080
- **Features**: 
  - File upload/download
  - User authentication (JWT)
  - File sharing
  - Audit logging
  - Rate limiting

### 🎨 Frontend (React + TypeScript)
- **Build**: Custom Dockerfile + Nginx
- **Port**: 3000
- **Features**:
  - Modern React with TypeScript
  - Apollo GraphQL client
  - Tailwind CSS styling
  - File management UI
  - Real-time updates

## ⚙️ Configuration

### Environment Variables

Copy example files and customize:

```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration  
cp frontend/.env.example frontend/.env
```

### Key Backend Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | database | Database hostname |
| `DB_USER` | admin | Database username |
| `DB_PASSWORD` | admin | Database password |
| `JWT_SECRET` | (generated) | JWT signing secret |
| `PORT` | 8080 | Backend server port |
| `AWS_REGION` | eu-north-1 | AWS S3 region |
| `AWS_ACCESS_KEY_ID` | (required) | AWS access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | (required) | AWS secret key for S3 |
| `S3_BUCKET` | go-drive-v2 | S3 bucket for file storage |

### Key Frontend Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | http://localhost:8080/query | Backend API URL |
| `VITE_MAX_FILE_SIZE` | 50MB | Maximum upload size |

## 🔧 Development

### Hot Reloading Setup

```bash
# Start with development overrides
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Backend will auto-reload on Go file changes
# Frontend will auto-reload on React file changes
```

### Database Migrations

Migrations run automatically on startup. To run manually:

```bash
docker-compose exec backend ./backend migrate
```

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Service Health
```bash
# Check service status
docker-compose ps

# Check health
docker-compose exec backend wget -qO- http://localhost:8080/health
```

## 🛠️ Management Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild Services
```bash
docker-compose up --build
```

### Clean Everything
```bash
docker-compose down -v --rmi all
docker system prune -a
```

## 📁 Volume Management

### Backup Database
```bash
docker-compose exec database pg_dump -U admin graphqlmvp > backup.sql
```

### Restore Database
```bash
docker-compose exec -T database psql -U admin graphqlmvp < backup.sql
```

### File Uploads
All uploaded files are stored in AWS S3. Ensure your AWS credentials are properly configured.

## 🚨 Troubleshooting

### Common Issues

**Port Conflicts:**
```bash
# Check what's using the ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080
netstat -tulpn | grep :5432
```

**Database Connection Issues:**
```bash
# Check database logs
docker-compose logs database

# Test database connection
docker-compose exec database psql -U admin -d graphqlmvp -c "SELECT 1;"
```

**Build Issues:**
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Reset Everything
```bash
# Nuclear option - removes all data
docker-compose down -v
docker system prune -a
docker volume prune
```

## 🔒 Production Deployment

### Security Checklist

- [ ] Change default database credentials
- [ ] Set strong JWT secret
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up backup strategy
- [ ] Monitor logs and metrics

### Recommended Production Changes

1. **Use external database** for better performance and backups
2. **Set up reverse proxy** (nginx/traefik) with SSL
3. **Configure monitoring** (Prometheus/Grafana)
4. **Set up log aggregation** (ELK stack)
5. **Use secrets management** (Docker secrets/Kubernetes)

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker setup
5. Submit a pull request

---

**Need help?** Check the troubleshooting section or open an issue on GitHub.