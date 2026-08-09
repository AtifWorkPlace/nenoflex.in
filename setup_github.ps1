# NenoFlex GitHub Repository Initializer & Push Script
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    NenoFlex Official Web - Push Updates to GitHub" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Initialize repo if needed
if (-not (Test-Path ".git")) {
    git init
    git branch -M main
}

# Set remote (safe: removes existing first)
git remote remove origin 2>$null
git remote add origin https://github.com/AtifWorkPlace/nenoflex.in.git

# Stage all changes
git add .

# Generate timestamped commit message
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$commitMsg = "NenoFlex Production Update [$timestamp] - SSR Hydration Fix, JWT Security, Concurrent API Fetch"

Write-Host "Committing: $commitMsg" -ForegroundColor Yellow
git commit -m "$commitMsg"

# Push to main
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "    Successfully pushed NenoFlex to GitHub!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
