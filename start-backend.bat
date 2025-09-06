@echo off
echo ========================================
echo    AL-BOQAI Center Backend Server
echo ========================================
echo.
echo Starting Django backend server...
echo.

cd /d "%~dp0core"

echo Checking if virtual environment exists...
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found. Creating one...
    python -m venv venv
    echo Virtual environment created successfully!
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing/updating requirements...
pip install -r requirements_production.txt

echo.
echo Starting Django server on http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver 0.0.0.0:8080

pause
