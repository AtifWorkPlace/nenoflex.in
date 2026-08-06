@echo off
echo ===================================================
echo     NenoFlex GitHub Repository Initializer & Push
echo ===================================================
echo.
git init
git branch -M main
git remote add origin https://github.com/AtifWorkPlace/nenoflex.in.git
git add .
git commit -m "Industrial Cross-Device Cloud Order Sync, Gmail Nodemailer & Cart Mobile Fit - NenoFlex Official Web (nenoflex.in)"
git checkout -b dev
git checkout main
git push -u origin main
git push -u origin dev
echo.
echo ===================================================
echo     Successfully pushed NenoFlex to GitHub!
echo ===================================================
pause
