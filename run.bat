@echo off
echo ===================================================
echo Starting Interactive Shadow Wall Local Server
echo ===================================================
echo Make sure you have Node JS installed. 
echo This will use npx http-server to serve the files.
echo.
echo Once the server starts, open your browser to:
echo http://127.0.0.1:8080 OR http://localhost:8080
echo ===================================================
npx http-server -c-1 -p 8080
pause
