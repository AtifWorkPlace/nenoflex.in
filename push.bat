@echo off
title NenoFlex Push to GitHub
cd /d "%~dp0"
echo ==============================================
echo   Pushing NenoFlex to GitHub (origin main)...
echo ==============================================
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Pushed to GitHub successfully!
) else (
    echo [ERROR] Push failed.
)
echo.
pause
