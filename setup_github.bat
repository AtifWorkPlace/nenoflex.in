@echo off
echo ===================================================
echo     NenoFlex GitHub Repository Initializer & Push
echo ===================================================
echo.
git init
git branch -M main
git remote add origin https://github.com/AtifWorkPlace/nenoflex.in.git
git add .
git commit -m "Fixed async race condition bug - Synchronous product title/price state & custom event listener - NenoFlex Official Web (nenoflex.in)"
git checkout -b dev
git checkout main
git push -u origin main
git push -u origin dev
echo.
echo ===================================================
echo     Successfully pushed NenoFlex to GitHub!
echo ===================================================
pause
