# PowerShell script to stop test database
Write-Host "Stopping test database..." -ForegroundColor Yellow

# Stop and remove Docker containers
docker-compose -f docker-compose.test.yml down -v

if ($LASTEXITCODE -eq 0) {
    Write-Host "Test database stopped and volumes removed." -ForegroundColor Green
} else {
    Write-Host "Failed to stop test database properly" -ForegroundColor Red
}
