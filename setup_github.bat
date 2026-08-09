@echo off
echo ===================================================
echo     NenoFlex Official Web - Push Updates to GitHub
echo ===================================================
echo.

if not exist ".git" (
    git init
    git branch -M main
)

git remote remove origin 2>nul
git remote add origin https://github.com/AtifWorkPlace/nenoflex.in.git
git add .

echo Committing changes...
git commit -m "NenoFlex Production Update - Fix Admin Orders Pipeline & Supabase Realtime Delivery"

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ===================================================
echo     Successfully pushed NenoFlex to GitHub!
echo ===================================================
pause
