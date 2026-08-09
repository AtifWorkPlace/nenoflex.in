# NenoFlex GitHub Repository Initializer & Push Script
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    NenoFlex Official Web - Push Updates to GitHub" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

git init
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/AtifWorkPlace/nenoflex.in.git
git add .
git commit -m "NenoFlex Production Release - Supabase Cloud DB & Nike PDP Upgrade"
git push -u origin main

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "    Successfully pushed NenoFlex to GitHub!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
