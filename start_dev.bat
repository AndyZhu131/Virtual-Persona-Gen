@echo off
echo Starting VPG Development Environment...
echo.

echo Starting Python Backend (FastAPI)...
start "VPG Backend" cmd /k "cd /d %~dp0 && python run_mvp.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend (Next.js)...
start "VPG Frontend" cmd /k "cd /d %~dp0\vpg-ui && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause
