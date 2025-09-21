# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Deployment pipeline for Balkan Drive.

## Overview

The CI pipeline automatically tests the entire application stack whenever code is pushed or a pull request is opened. It verifies that the Docker Compose setup works correctly and all services integrate properly.

## Pipeline Components

### 🔄 GitHub Actions Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop` branches

**What it tests:**
1. **Database Integration** - PostgreSQL connection, schema validation, migrations
2. **Backend API** - Health endpoints, GraphQL functionality, authentication
3. **Frontend** - React app loading, HTTP responses
4. **End-to-End Flow** - User registration, JWT authentication, file operations
5. **Security Features** - Rate limiting, input validation
6. **Performance** - Service startup times, resource usage

### 🏥 Health Check Scripts

#### Linux/macOS (`scripts/health-check.sh`)
```bash
# Make executable
chmod +x scripts/health-check.sh

# Run health check
./scripts/health-check.sh
```

#### Windows PowerShell (`scripts/health-check.ps1`)
```powershell
# Run health check
.\scripts\health-check.ps1
```

## Local Testing

### Quick Health Check
```bash
# Start the application
docker-compose up -d

# Wait a moment for services to start, then run health check
./scripts/health-check.sh
```

### Manual Verification
```bash
# Check service status
docker-compose ps

# Test individual services
curl http://localhost:8080/health           # Backend health
curl http://localhost:3001                  # Frontend
curl -X POST http://localhost:8080/query \  # GraphQL
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

## What Each Test Validates

### 🗄️ Database Tests
- PostgreSQL is accepting connections
- Database `graphqlmvp` exists and is accessible  
- Essential tables are created (`users`, `files`, `folders`, `content`, `audit_logs`)
- Migrations have run successfully

### 🔧 Backend API Tests
- Health endpoint responds correctly (`/health`)
- GraphQL endpoint accepts queries (`/query`)
- Schema introspection works
- JWT authentication flow
- User registration and login
- File upload endpoints
- Rate limiting enforcement

### 🌐 Frontend Tests
- Nginx serves the React application
- HTTP 200 response on main page
- React root container is present
- Static assets are accessible

### 🔐 Security Tests
- JWT token generation and validation
- Password hashing (bcrypt)
- Rate limiting (429 responses after threshold)
- SQL injection prevention (parameterized queries)
- Input validation through GraphQL schema

### 📊 Integration Tests
- End-to-end user registration flow
- Authentication with generated tokens
- Database persistence of user data
- Cross-service communication

## Environment Variables

The CI pipeline uses these test environment variables:

```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=graphqlmvp
JWT_SECRET=test-jwt-secret-for-ci
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=test-key
AWS_SECRET_ACCESS_KEY=test-secret
S3_BUCKET=test-bucket
RATE_LIMIT=10.0
RATE_LIMIT_BURST=20
DEFAULT_STORAGE_QUOTA=104857600
```

## Troubleshooting

### Common Issues

**Docker Compose command not found:**
- Modern Docker installations use `docker compose` (without hyphen) instead of `docker-compose`
- The CI pipeline and health check scripts have been updated to use the new format
- If you have an older Docker version, you may need to install docker-compose separately

**Service naming issues:**
- The pipeline uses the correct service names from docker-compose.yml:
  - `database` (not `postgres`) for PostgreSQL
  - `backend` for the Go API server
  - `frontend` for the React application

**Services not starting:**
```bash
# Check container logs
docker compose logs backend
docker compose logs frontend
docker compose logs database

# Restart services
docker compose down
docker compose up -d --build
```

**Database connection issues:**
```bash
# Verify PostgreSQL is ready
docker compose exec database pg_isready -h localhost -U admin

# Check database exists
docker compose exec database psql -U admin -l
```

**Port conflicts:**
```bash
# Check what's using the ports
netstat -tulpn | grep :8080  # Backend
netstat -tulpn | grep :3001  # Frontend
netstat -tulpn | grep :5432  # PostgreSQL
```

### CI Pipeline Failures

**Build failures:**
- Check Docker build logs in the CI output
- Verify all required files are committed
- Ensure environment variables are properly set

**Health check timeouts:**
- Services may need more time to start in CI environment
- Check if resource limits are causing slow startup
- Review container logs in the CI output

**Test failures:**
- Database schema issues: Check migration files
- API endpoint failures: Verify GraphQL schema changes
- Authentication issues: Check JWT secret configuration

## Performance Considerations

**CI Pipeline Optimization:**
- Uses Docker layer caching for faster builds
- Parallel service startup where possible
- Configurable timeout values
- Efficient health check intervals

**Resource Usage:**
- Pipeline typically completes in 10-15 minutes
- Uses standard GitHub Actions runners
- Minimal resource requirements for test services

## Security Notes

**Test Data:**
- Pipeline uses temporary test users (cleaned up automatically)
- No production data is used in CI
- Test secrets are separate from production

**Access Control:**
- Only authorized repositories can run the pipeline
- No sensitive production environment variables exposed
- Rate limiting prevents CI abuse

## Extending the Pipeline

### Adding New Tests
1. Add test functions to health check scripts
2. Update CI workflow if needed
3. Document new test coverage

### Custom Checks
```bash
# Add custom health checks to scripts
test_custom_feature() {
    log_info "Testing custom feature..."
    # Your test logic here
    return 0
}
```

### Integration with Deployment
```yaml
# Add deployment step to CI workflow
- name: Deploy to staging
  if: github.ref == 'refs/heads/main'
  run: |
    # Deployment commands
```

## Monitoring

The pipeline provides comprehensive logging for:
- Service startup times
- Resource usage statistics  
- Error messages and stack traces
- Performance metrics

All logs are preserved in GitHub Actions for debugging and analysis.