@echo off
echo Starting KMRL Document Platform...
echo.

:: Create pdf_files directory if it doesn't exist
if not exist "pdf_files" mkdir pdf_files

:: Check if backend requirements are installed
echo Checking backend dependencies...
python -m pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing backend dependencies...
    cd backend
    pip install -r requirements.txt
    cd ..
) else (
    echo Backend dependencies already installed.
)

:: Start backend server
echo.
echo Starting backend server...
start "KMRL Backend" cmd /k "cd backend && python main.py"

:: Wait a bit for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend development server
echo Starting frontend development server...
cd kmrl-document-platform
start "KMRL Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo KMRL Document Platform is starting!
echo ========================================
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to exit...
pause >nul