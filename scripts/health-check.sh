#!/bin/bash

# Balkan Drive - Docker Compose Health Check Script
# This script verifies that all services in the application stack are running correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_WAIT_TIME=300  # 5 minutes
CHECK_INTERVAL=5   # 5 seconds

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to wait for a service to be ready
wait_for_service() {
    local service_name=$1
    local check_command=$2
    local max_wait=$3
    local waited=0
    
    log_info "Waiting for $service_name to be ready..."
    
    while [ $waited -lt $max_wait ]; do
        if eval "$check_command" &>/dev/null; then
            log_success "$service_name is ready! (waited ${waited}s)"
            return 0
        fi
        
        sleep $CHECK_INTERVAL
        waited=$((waited + CHECK_INTERVAL))
        
        if [ $((waited % 30)) -eq 0 ]; then
            log_info "Still waiting for $service_name... (${waited}s elapsed)"
        fi
    done
    
    log_error "$service_name failed to start within ${max_wait} seconds"
    return 1
}

# Function to check if docker-compose is running
check_docker_compose() {
    log_info "Checking if Docker Compose services are running..."
    
    if ! docker-compose ps --quiet &>/dev/null; then
        log_error "Docker Compose is not running. Please run 'docker-compose up -d' first."
        exit 1
    fi
    
    local running_services=$(docker-compose ps --services --filter "status=running")
    local all_services=$(docker-compose ps --services)
    
    log_info "Running services: $running_services"
    log_info "All services: $all_services"
    
    if [ -z "$running_services" ]; then
        log_error "No services are running"
        exit 1
    fi
}

# Function to test PostgreSQL database
test_database() {
    log_info "Testing PostgreSQL database..."
    
    # Test basic connection
    if ! docker-compose exec -T postgres pg_isready -h localhost -U admin &>/dev/null; then
        log_error "PostgreSQL is not ready"
        return 1
    fi
    
    # Test database exists and is accessible
    if ! docker-compose exec -T postgres psql -U admin -d graphqlmvp -c "SELECT 1;" &>/dev/null; then
        log_error "Cannot connect to graphqlmvp database"
        return 1
    fi
    
    # Check essential tables exist
    local table_count=$(docker-compose exec -T postgres psql -U admin -d graphqlmvp -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'files', 'folders', 'content', 'audit_logs');" 2>/dev/null | tr -d ' \n')
    
    if [ "$table_count" -ge "4" ]; then
        log_success "Database schema is properly initialized ($table_count essential tables found)"
    else
        log_warning "Database schema may be incomplete (only $table_count essential tables found)"
    fi
    
    return 0
}

# Function to test backend API
test_backend() {
    log_info "Testing backend API..."
    
    # Test health endpoint
    local health_response=$(curl -s -f http://localhost:8080/health 2>/dev/null)
    if [ $? -eq 0 ]; then
        log_success "Backend health endpoint is responding"
    else
        log_error "Backend health endpoint is not responding"
        return 1
    fi
    
    # Test GraphQL endpoint with introspection
    local graphql_response=$(curl -s -X POST http://localhost:8080/query \
        -H "Content-Type: application/json" \
        -d '{"query": "{ __schema { types { name } } }"}' 2>/dev/null)
    
    if [[ $graphql_response == *"__schema"* ]]; then
        log_success "GraphQL endpoint is responding correctly"
    else
        log_error "GraphQL endpoint is not responding correctly"
        return 1
    fi
    
    return 0
}

# Function to test frontend
test_frontend() {
    log_info "Testing frontend..."
    
    # Test if frontend serves the main page
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null)
    
    if [ "$status_code" = "200" ]; then
        log_success "Frontend is serving content (HTTP $status_code)"
    else
        log_error "Frontend is not responding correctly (HTTP $status_code)"
        return 1
    fi
    
    # Check if React app is loading
    local content=$(curl -s http://localhost:3001 2>/dev/null)
    if [[ $content == *"<div id=\"root\">"* ]] || [[ $content == *"React"* ]]; then
        log_success "React application is loading correctly"
    else
        log_warning "Frontend content may not be loading React app correctly"
    fi
    
    return 0
}

# Function to test basic authentication flow
test_authentication() {
    log_info "Testing authentication flow..."
    
    # Generate a unique test user
    local timestamp=$(date +%s)
    local test_email="healthcheck_$timestamp@example.com"
    local test_username="healthcheck_$timestamp"
    
    # Test user registration
    local register_response=$(curl -s -X POST http://localhost:8080/query \
        -H "Content-Type: application/json" \
        -d "{
            \"query\": \"mutation { register(username: \\\"$test_username\\\", email: \\\"$test_email\\\", password: \\\"testpass123\\\", role: \\\"user\\\") { token user { id username } } }\"
        }" 2>/dev/null)
    
    if [[ $register_response == *"token"* ]] && [[ $register_response != *"error"* ]]; then
        log_success "User registration is working"
        
        # Extract token and test authenticated request
        local token=$(echo $register_response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$token" ]; then
            local auth_test=$(curl -s -X POST http://localhost:8080/query \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d '{"query": "{ listFiles { id } }"}' 2>/dev/null)
            
            if [[ $auth_test == *"listFiles"* ]]; then
                log_success "JWT authentication is working"
            else
                log_warning "JWT authentication may have issues"
            fi
        fi
    else
        log_warning "User registration may have issues: $register_response"
    fi
    
    return 0
}

# Function to show service status
show_service_status() {
    log_info "=== Service Status ==="
    docker-compose ps
    
    log_info "=== Container Resource Usage ==="
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker-compose ps -q) 2>/dev/null || log_warning "Could not get container stats"
}

# Main execution
main() {
    log_info "🚀 Starting Balkan Drive Health Check..."
    echo
    
    # Check if docker-compose is running
    check_docker_compose
    echo
    
    # Wait for all services to be ready
    wait_for_service "PostgreSQL" "docker-compose exec -T postgres pg_isready -h localhost -U admin" 60 || exit 1
    wait_for_service "Backend" "curl -f http://localhost:8080/health" 120 || exit 1
    wait_for_service "Frontend" "curl -f http://localhost:3001" 60 || exit 1
    echo
    
    # Run comprehensive tests
    log_info "🧪 Running comprehensive health checks..."
    echo
    
    test_database || exit 1
    echo
    
    test_backend || exit 1
    echo
    
    test_frontend || exit 1
    echo
    
    test_authentication || exit 1
    echo
    
    # Show final status
    show_service_status
    echo
    
    log_success "🎉 All health checks passed! Balkan Drive is running correctly."
    log_info "You can access:"
    log_info "  • Frontend: http://localhost:3001"
    log_info "  • Backend API: http://localhost:8080/query"
    log_info "  • GraphQL Playground: http://localhost:8080"
    log_info "  • API Documentation: http://localhost:8080/docs"
}

# Handle script interruption
trap 'log_warning "Health check interrupted"; exit 1' INT TERM

# Run main function
main "$@"