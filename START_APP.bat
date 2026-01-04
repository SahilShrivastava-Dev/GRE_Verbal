@echo off
echo ========================================
echo   GRE Vocab Builder - Starting App
echo ========================================
echo.

REM Check if node_modules exist
if not exist "backend\node_modules\" (
    echo [1/4] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
) else (
    echo [1/4] Backend dependencies already installed ✓
)

if not exist "frontend\node_modules\" (
    echo [2/4] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
) else (
    echo [2/4] Frontend dependencies already installed ✓
)

REM Check if .env exists
if not exist "backend\.env" (
    echo.
    echo ⚠️  WARNING: backend\.env file not found!
    echo    Please create backend\.env and add your OpenRouter API key
    echo    You can copy from backend\.env.example
    echo.
    pause
    exit /b 1
)

echo [3/4] Starting backend server...
echo.
start "GRE Vocab - Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo [4/4] Starting frontend...
echo.
start "GRE Vocab - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   ✓ App is starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two terminal windows will open.
echo Keep both running while using the app.
echo.
echo Press any key to exit this window...
pause >nul

