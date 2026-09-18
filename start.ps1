# =============================================================
# Famehub AI-Powered Hiring Platform - One-Command Startup
# Usage: .\start.ps1
#        .\start.ps1 -Mode docker    (for full Docker stack)
#        .\start.ps1 -Mode dev       (default: dev servers)
# =============================================================
param(
    [string]$Mode = "dev"
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host ""
Write-Host "  + + +   +++  ++   ++ " -ForegroundColor Cyan
Write-Host "  +----++--++ +----+     +--+" -ForegroundColor Cyan
Write-Host "  +  +++     ++" -ForegroundColor Cyan
Write-Host "  +--+  +--++++--+  +--   +--+" -ForegroundColor Cyan
Write-Host "          +-+ +  +++++" -ForegroundColor Cyan
Write-Host "  +-+     +-+  +-++-+     +-++------++-+  +-+ +-----+ +-----+ " -ForegroundColor Cyan
Write-Host "        AI-Powered Hiring & Assessment Platform" -ForegroundColor Magenta
Write-Host ""

if ($Mode -eq "docker") {
    Write-Host "[Docker] Starting full stack via Docker Compose..." -ForegroundColor Yellow
    $composePath = Join-Path $root "docker\docker-compose.yml"
    docker compose -f $composePath up --build -d
    Write-Host ""
    Write-Host "[Docker] All services started!" -ForegroundColor Green
    Write-Host "  -> Frontend : http://localhost" -ForegroundColor Cyan
    Write-Host "  -> Backend  : http://localhost:8080" -ForegroundColor Cyan
    Write-Host "  -> Judge0   : http://localhost:2358" -ForegroundColor Cyan
    Write-Host "  -> Swagger  : http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To stop: docker compose -f docker\docker-compose.yml down" -ForegroundColor Gray
} else {
    Write-Host "[Dev] Starting backend (Spring Boot) and frontend (Vite) in parallel..." -ForegroundColor Yellow
    Write-Host ""

    # Start backend in new terminal window
    $backendPath = Join-Path $root "backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Spring Boot Backend...' -ForegroundColor Green; mvn spring-boot:run" -WorkingDirectory $backendPath -WindowStyle Normal

    Start-Sleep -Seconds 2

    # Start frontend in new terminal window
    $frontendPath = Join-Path $root "frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Vite Frontend...' -ForegroundColor Cyan; npm run dev" -WorkingDirectory $frontendPath -WindowStyle Normal

    Write-Host ""
    Write-Host "[Dev] Both servers launching in separate windows!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  -> Frontend : http://localhost:5173" -ForegroundColor Cyan
    Write-Host "  -> Backend  : http://localhost:8080" -ForegroundColor Cyan
    Write-Host "  -> Swagger  : http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Default accounts (seeded on first run):" -ForegroundColor Gray
    Write-Host "  HR      : hr@famehub.io   / password" -ForegroundColor Gray
    Write-Host "  Admin   : admin@famehub.io / password" -ForegroundColor Gray
    Write-Host ""
}
