@echo off
echo ===================================================
echo     NenoFlex Official Web - Push Updates to GitHub
echo ===================================================
echo.
git init
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/AtifWorkPlace/nenoflex.in.git
git add .
git commit -m "NenoFlex Production Release - Supabase Cloud DB & Nike PDP Upgrade"
git push -u origin main
echo.
echo ===================================================
echo     Successfully pushed NenoFlex to GitHub!
echo ===================================================
pause
