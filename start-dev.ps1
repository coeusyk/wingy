# Wingy Development Starter
# This script starts both backend and frontend servers

Write-Host "=" -NoNewline
Write-Host ("=" * 59)
Write-Host "🎮 Starting Wingy Development Environment" -ForegroundColor Cyan
Write-Host "=" -NoNewline  
Write-Host ("=" * 59)
Write-Host ""

# Check if backend directory exists
if (-not (Test-Path "wingy-backend")) {
    Write-Host "❌ Error: wingy-backend directory not found" -ForegroundColor Red
    Write-Host "   Run this script from the wingy project root directory"
    exit 1
}

# Check if frontend directory exists
if (-not (Test-Path "wingy-frontend")) {
    Writewingy--Host "❌ Error: wingy-frontend directory not fwingy-ound" -ForegroundColor Red
    Write-Host "   Run this script from the wingy project root directory"
    exit 1
}

Write-Host "📋 Pre-flight checks..." -ForegroundColor Yellow
Write-Host ""

# Check Python
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python: $pythonVersion"
} else {
    Write-Host "❌ Python not found - Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Check Node
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js: $nodeVersion"
} else {
    Write-Host "❌ Node.js not found - Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting servers..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will run on:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press CTRL+C to stop both servers" -ForegroundColwingy-or Yellow
Write-Host ""

# Start backend in background
Write-Host "▶  Starting backend server..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\wingy-backend
    python run_api.py
}

# Start frontend in background  
Write-Host "▶  Starting frontend server..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\wingy-frontend
    npm run dev
}

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=" -NoNewline
Write-Host ("=" * 59)
Write-Host "✅ Both servers started!" -ForegroundColor Green
Write-Host "=" -NoNewline
Write-Host ("=" * 59)
Write-Host ""
Write-Host "🌐 Open your browser:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend API Docs: http://localhost:8000/docs"
Write-Host ""
Write-Host "📊 View server logs:"
Write-Host "   Backend:  Receive-Job $($backendJob.Id) -Keep"
Write-Host "   Frontend: Receive-Job $($frontendJob.Id) -Keep"
Write-Host ""

# Monitor jobs
try {
    Write-Host "Monitoring servers (press CTRL+C to stop)..." -ForegroundColor Yellow
    while ($true) {
        if ($backendJob.State -eq "Completed" -or $backendJob.State -eq "Failed") {
            Write-Host "⚠️  Backend server stopped" -ForegroundColor Red
            Receive-Job $backendJob
            break
        }
        if ($frontendJob.State -eq "Completed" -or $frontendJob.State -eq "Failed") {
            Write-Host "⚠️  Frontend server stopped" -ForegroundColor Red
            Receive-Job $frontendJob
            break
        }
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "✅ Servers stopped" -ForegroundColor Green
}
