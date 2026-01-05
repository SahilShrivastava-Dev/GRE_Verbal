@echo off
echo ========================================
echo   Deploying GRE Verbal App to Firebase
echo ========================================
echo.

cd frontend

echo Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo Step 2: Building frontend...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo Step 3: Deploying to Firebase...
cd ..
call firebase deploy --only hosting

if errorlevel 1 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ Deployment Successful!
echo ========================================
echo.
echo Your app is live at:
echo https://gre-verbal-app.web.app
echo.
pause

