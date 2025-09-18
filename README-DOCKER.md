# 🚀 Balkan Drive - Simple Docker Setup

A complete file storage and sharing application with a single Docker Compose setup for easy local testing and deployment.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- 4GB RAM minimum
- 10GB disk space

## 🏃‍♂️ Quick Start

### Option 1: Using Startup Scripts

**Windows:**
```cmd
start.bat
```

**Linux/macOS:**
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Direct Docker Compose

```bash
docker compose up --build -d
```

## 🌐 Access Points

After starting, access the application at:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/query
- **Database:** localhost:5432 (credentials: admin/admin)

## ⚙️ Configuration

### AWS S3 Setup (Required)

The application uses AWS S3 for file storage. You can configure this in two ways:

#### Method 1: Environment File
Create a `.env` file in the root directory:
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET=your_bucket_name
AWS_REGION=eu-north-1
```

#### Method 2: Environment Variables
Set the variables in your system:
```bash
export AWS_ACCESS_KEY_ID=your_aws_access_key
export AWS_SECRET_ACCESS_KEY=your_aws_secret_key
export S3_BUCKET=your_bucket_name
```

### Default Configuration

The setup includes sensible defaults:
- **Database:** PostgreSQL with admin/admin credentials
- **S3 Region:** eu-north-1
- **S3 Bucket:** go-drive-v2 (override with environment variables)
- **Storage Quota:** 10MB per user

## 🛠️ Management Commands

```bash
# Start the application
docker compose up -d

# View logs
docker compose logs -f

# Stop the application
docker compose down

# Restart services
docker compose restart

# Rebuild and start
docker compose up --build -d

# Clean everything (removes data!)
docker compose down -v
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │────│     Backend     │────│    Database     │
│   (React/TS)    │    │   (Go/GraphQL)  │    │  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   AWS S3 Files  │
                       │   (File Storage)│
                       └─────────────────┘
```

## 🐳 What's Included

- **PostgreSQL Database:** Persistent data storage
- **Go Backend:** GraphQL API with file management
- **React Frontend:** Modern web interface
- **S3 Integration:** Cloud file storage
- **Health Checks:** Automatic service monitoring
- **Auto Migration:** Database setup on first run

## 🚨 Troubleshooting

### Port Conflicts
```bash
# Check what's using the ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080
netstat -tulpn | grep :5432
```

### Service Issues
```bash
# Check service status
docker compose ps

# View specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs database
```

### Clean Restart
```bash
# Stop everything and clean up
docker compose down -v
docker system prune -a

# Start fresh
docker compose up --build -d
```

## 🔒 Production Notes

For production deployment:

1. **Change Database Password:** Update POSTGRES_PASSWORD in docker-compose.yml
2. **Set Strong JWT Secret:** Update JWT_SECRET environment variable
3. **Configure Proper S3 Credentials:** Use IAM roles or secure credential management
4. **Set Up SSL/TLS:** Add reverse proxy (nginx/traefik) with certificates
5. **Configure Monitoring:** Add logging and health monitoring

## 📁 File Structure

```
Balkan_Drive/
├── docker-compose.yml      # Single compose file for everything
├── start.bat              # Windows startup script
├── start.sh               # Linux/macOS startup script
├── .env                   # Environment variables (create this)
├── backend/
│   ├── Dockerfile         # Backend container
│   └── ...
├── frontend/
│   ├── Dockerfile         # Frontend container
│   └── ...
└── README.md             # This file
```

## 🤝 Testing on Other Systems

To test on another system:

1. **Clone the repository**
2. **Install Docker and Docker Compose**
3. **Set up AWS credentials** (create `.env` file or set environment variables)
4. **Run:** `docker compose up --build -d`
5. **Access:** http://localhost:3000

That's it! The entire application will be running in containers.

---

**Need help?** Check the logs with `docker compose logs -f` or open an issue on GitHub.