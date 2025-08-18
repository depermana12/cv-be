# PowerShell script to start test database
Write-Host "Starting test database..." -ForegroundColor Green

# Start Docker Compose for test database
docker-compose -f docker-compose.test.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start Docker containers" -ForegroundColor Red
    exit 1
}

# Wait for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow

$maxAttempts = 30
$attempt = 0

do {
    $attempt++
    $result = docker exec cv-be-test-db pg_isready -U test_user -d cv_test 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database is ready!" -ForegroundColor Green
        break
    }
    
    if ($attempt -ge $maxAttempts) {
        Write-Host "Database failed to start after $maxAttempts attempts" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Waiting for PostgreSQL... (attempt $attempt/$maxAttempts)"
    Start-Sleep -Seconds 1
} while ($true)

# Apply migrations if you have a migration script
# npx drizzle-kit migrate

Write-Host "Test database setup complete." -ForegroundColor Green
