# Balkan Drive - Docker Compose Health Check Script (PowerShell)
# This script verifies that all services in the application stack are running correctly

param(
    [int]$MaxWaitTime = 300,  # 5 minutes
    [int]$CheckInterval = 5   # 5 seconds
)

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Log-Info($message) {
    Write-ColorOutput Blue "[INFO] $message"
}

function Log-Success($message) {
    Write-ColorOutput Green "[SUCCESS] $message"
}

function Log-Warning($message) {
    Write-ColorOutput Yellow "[WARNING] $message"
}

function Log-Error($message) {
    Write-ColorOutput Red "[ERROR] $message"
}

# Function to wait for a service to be ready
function Wait-ForService {
    param(
        [string]$ServiceName,
        [scriptblock]$CheckCommand,
        [int]$MaxWait
    )
    
    Log-Info "Waiting for $ServiceName to be ready..."
    
    $waited = 0
    while ($waited -lt $MaxWait) {
        try {
            $result = & $CheckCommand
            if ($result) {
                Log-Success "$ServiceName is ready! (waited ${waited}s)"
                return $true
            }
        } catch {
            # Continue waiting
        }
        
        Start-Sleep -Seconds $CheckInterval
        $waited += $CheckInterval
        
        if (($waited % 30) -eq 0) {
            Log-Info "Still waiting for $ServiceName... (${waited}s elapsed)"
        }
    }
    
    Log-Error "$ServiceName failed to start within $MaxWait seconds"
    return $false
}

# Function to check if docker-compose is running
function Test-DockerCompose {
    Log-Info "Checking if Docker Compose services are running..."
    
    try {
        $services = docker-compose ps --quiet 2>$null
        if (-not $services) {
            Log-Error "Docker Compose is not running. Please run 'docker-compose up -d' first."
            exit 1
        }
        
        $runningServices = docker-compose ps --services --filter "status=running" 2>$null
        $allServices = docker-compose ps --services 2>$null
        
        Log-Info "Running services: $runningServices"
        Log-Info "All services: $allServices"
        
        if (-not $runningServices) {
            Log-Error "No services are running"
            exit 1
        }
    } catch {
        Log-Error "Error checking Docker Compose status: $_"
        exit 1
    }
}

# Function to test PostgreSQL database
function Test-Database {
    Log-Info "Testing PostgreSQL database..."
    
    try {
        # Test basic connection
        $pgReady = docker-compose exec -T postgres pg_isready -h localhost -U admin 2>$null
        if ($LASTEXITCODE -ne 0) {
            Log-Error "PostgreSQL is not ready"
            return $false
        }
        
        # Test database exists and is accessible
        $dbTest = docker-compose exec -T postgres psql -U admin -d graphqlmvp -c "SELECT 1;" 2>$null
        if ($LASTEXITCODE -ne 0) {
            Log-Error "Cannot connect to graphqlmvp database"
            return $false
        }
        
        # Check essential tables exist
        $tableCount = docker-compose exec -T postgres psql -U admin -d graphqlmvp -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'files', 'folders', 'content', 'audit_logs');" 2>$null
        $tableCount = $tableCount.Trim()
        
        if ([int]$tableCount -ge 4) {
            Log-Success "Database schema is properly initialized ($tableCount essential tables found)"
        } else {
            Log-Warning "Database schema may be incomplete (only $tableCount essential tables found)"
        }
        
        return $true
    } catch {
        Log-Error "Database test failed: $_"
        return $false
    }
}

# Function to test backend API
function Test-Backend {
    Log-Info "Testing backend API..."
    
    try {
        # Test health endpoint
        $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 10
        Log-Success "Backend health endpoint is responding"
        
        # Test GraphQL endpoint with introspection
        $graphqlBody = @{
            query = "{ __schema { types { name } } }"
        } | ConvertTo-Json
        
        $graphqlResponse = Invoke-RestMethod -Uri "http://localhost:8080/query" -Method Post -Body $graphqlBody -ContentType "application/json" -TimeoutSec 15
        
        if ($graphqlResponse -and $graphqlResponse.data -and $graphqlResponse.data.__schema) {
            Log-Success "GraphQL endpoint is responding correctly"
        } else {
            Log-Error "GraphQL endpoint is not responding correctly"
            return $false
        }
        
        return $true
    } catch {
        Log-Error "Backend test failed: $_"
        return $false
    }
}

# Function to test frontend
function Test-Frontend {
    Log-Info "Testing frontend..."
    
    try {
        # Test if frontend serves the main page
        $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method Get -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Log-Success "Frontend is serving content (HTTP $($response.StatusCode))"
        } else {
            Log-Error "Frontend is not responding correctly (HTTP $($response.StatusCode))"
            return $false
        }
        
        # Check if React app is loading
        $content = $response.Content
        if ($content -match '<div id="root">' -or $content -match 'React') {
            Log-Success "React application is loading correctly"
        } else {
            Log-Warning "Frontend content may not be loading React app correctly"
        }
        
        return $true
    } catch {
        Log-Error "Frontend test failed: $_"
        return $false
    }
}

# Function to test basic authentication flow
function Test-Authentication {
    Log-Info "Testing authentication flow..."
    
    try {
        # Generate a unique test user
        $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
        $testEmail = "healthcheck_$timestamp@example.com"
        $testUsername = "healthcheck_$timestamp"
        
        # Test user registration
        $registerBody = @{
            query = "mutation { register(username: `"$testUsername`", email: `"$testEmail`", password: `"testpass123`", role: `"user`") { token user { id username } } }"
        } | ConvertTo-Json
        
        $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/query" -Method Post -Body $registerBody -ContentType "application/json" -TimeoutSec 15
        
        if ($registerResponse.data -and $registerResponse.data.register -and $registerResponse.data.register.token) {
            Log-Success "User registration is working"
            
            # Extract token and test authenticated request
            $token = $registerResponse.data.register.token
            
            $authHeaders = @{
                'Authorization' = "Bearer $token"
                'Content-Type' = 'application/json'
            }
            
            $authBody = @{
                query = "{ listFiles { id } }"
            } | ConvertTo-Json
            
            $authTest = Invoke-RestMethod -Uri "http://localhost:8080/query" -Method Post -Body $authBody -Headers $authHeaders -TimeoutSec 10
            
            if ($authTest.data -and $authTest.data.PSObject.Properties.Name -contains "listFiles") {
                Log-Success "JWT authentication is working"
            } else {
                Log-Warning "JWT authentication may have issues"
            }
        } else {
            Log-Warning "User registration may have issues"
        }
        
        return $true
    } catch {
        Log-Warning "Authentication test failed: $_"
        return $true  # Non-critical failure
    }
}

# Function to show service status
function Show-ServiceStatus {
    Log-Info "=== Service Status ==="
    docker-compose ps
    
    Log-Info "=== Container Resource Usage ==="
    try {
        $containerIds = docker-compose ps -q
        if ($containerIds) {
            docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $containerIds
        }
    } catch {
        Log-Warning "Could not get container stats"
    }
}

# Main execution
function Main {
    Log-Info "🚀 Starting Balkan Drive Health Check..."
    Write-Host ""
    
    # Check if docker-compose is running
    Test-DockerCompose
    Write-Host ""
    
    # Wait for all services to be ready
    $postgresReady = Wait-ForService "PostgreSQL" { 
        docker-compose exec -T postgres pg_isready -h localhost -U admin 2>$null
        return $LASTEXITCODE -eq 0
    } 60
    
    if (-not $postgresReady) { exit 1 }
    
    $backendReady = Wait-ForService "Backend" {
        try {
            Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 5 > $null
            return $true
        } catch {
            return $false
        }
    } 120
    
    if (-not $backendReady) { exit 1 }
    
    $frontendReady = Wait-ForService "Frontend" {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method Get -TimeoutSec 5
            return $response.StatusCode -eq 200
        } catch {
            return $false
        }
    } 60
    
    if (-not $frontendReady) { exit 1 }
    
    Write-Host ""
    
    # Run comprehensive tests
    Log-Info "🧪 Running comprehensive health checks..."
    Write-Host ""
    
    if (-not (Test-Database)) { exit 1 }
    Write-Host ""
    
    if (-not (Test-Backend)) { exit 1 }
    Write-Host ""
    
    if (-not (Test-Frontend)) { exit 1 }
    Write-Host ""
    
    Test-Authentication | Out-Null
    Write-Host ""
    
    # Show final status
    Show-ServiceStatus
    Write-Host ""
    
    Log-Success "🎉 All health checks passed! Balkan Drive is running correctly."
    Log-Info "You can access:"
    Log-Info "  • Frontend: http://localhost:3001"
    Log-Info "  • Backend API: http://localhost:8080/query"
    Log-Info "  • GraphQL Playground: http://localhost:8080"
    Log-Info "  • API Documentation: http://localhost:8080/docs"
}

# Handle script interruption
try {
    Main
} catch {
    Log-Error "Health check failed: $_"
    exit 1
}