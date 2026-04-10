@echo off
REM AgriConnect AI - Windows Setup Script

title AgriConnect AI Setup

echo.
echo ================================================
echo    AgriConnect AI - Setup Script (Windows)
echo ================================================
echo.

SET /P MYSQL_PASS=Enter your MySQL root password: 

REM 1. Database
echo.
echo [1/4] Setting up MySQL database...
mysql -u root -p%MYSQL_PASS% < schema.sql
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Database setup failed. Check MySQL credentials.
    pause & exit /b 1
)
echo Database created successfully!

REM 2. Backend
echo.
echo [2/4] Setting up Python backend...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install --upgrade pip -q
pip install -r requirements.txt -q
cd ..
echo Backend dependencies installed!

REM 3. Frontend
echo.
echo [3/4] Setting up React frontend...
cd frontend
call npm install --silent
cd ..
echo Frontend dependencies installed!

echo.
echo ================================================
echo    Setup Complete!
echo ================================================
echo.
echo To start the application:
echo.
echo   Terminal 1 (Backend):
echo   cd backend ^& venv\Scripts\activate ^& uvicorn app.main:app --reload
echo.
echo   Terminal 2 (Frontend):
echo   cd frontend ^& npm start
echo.
echo Default Admin Login:
echo   Email:    admin@agriconnect.com
echo   Password: admin123
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo.
pause
