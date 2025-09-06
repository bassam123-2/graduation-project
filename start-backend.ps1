# AL-BOQAI Center Backend Server Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AL-BOQAI Center Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to the core directory
Set-Location "$PSScriptRoot\core"

Write-Host "Checking if virtual environment exists..." -ForegroundColor Yellow
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "Virtual environment created successfully!" -ForegroundColor Green
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

Write-Host "Installing/updating requirements..." -ForegroundColor Yellow
pip install -r requirements_production.txt

Write-Host ""
Write-Host "Starting Django server on http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the Django server
python manage.py runserver 0.0.0.0:8080
