@echo off
echo Starting FoodRedist...

:: Kill any previous instances
taskkill /F /IM node.exe >nul 2>&1

:: Start MongoDB if not already running
netstat -an | findstr ":27017 " | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo Starting MongoDB...
    start "" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db" --logpath "C:\data\mongod.log" --logappend
    timeout /t 3 /nobreak >nul
)

:: Start backend
echo Starting Backend on port 5000...
start "FoodRedist Backend" cmd /k "cd /d %~dp0backend && node server.js"

:: Wait for backend to be ready
timeout /t 4 /nobreak >nul

:: Start frontend
echo Starting Frontend on port 5173...
start "FoodRedist Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers starting...
echo Backend:  http://localhost:5000/api/health
echo Frontend: http://localhost:5173
echo.
pause
