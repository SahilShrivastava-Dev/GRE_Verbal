@echo off
echo Updating backend .env with new API key...
cd backend
(
echo PORT=5000
echo OPENROUTER_API_KEY=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
echo OPENROUTER_MODEL=xiaomi/mimo-v2-flash:free
) > .env
echo.
echo ✅ API key updated successfully!
echo.
echo Please restart your backend server:
echo   1. Stop backend (Ctrl+C)
echo   2. Run: npm start
echo.
pause

