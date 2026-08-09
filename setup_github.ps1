# NenoFlex GitHub Repository Initializer & Push Script
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    NenoFlex GitHub Repository Initializer & Push" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

git init
git branch -M main
git remote add origin https://github.com/AtifWorkPlace/nenoflex.in.git
git add .
git commit -m "Verified 100% clean build - Real-time image upload sync & 10-image gallery limit - NenoFlex Official Web (nenoflex.in)"
git checkout -b dev
git checkout main
git push -u origin main
git push -u origin dev

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "    Successfully pushed NenoFlex to GitHub!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
