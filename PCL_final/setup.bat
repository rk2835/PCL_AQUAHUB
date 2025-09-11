@echo off
echo Setting up AquaHub Database...

echo.
echo Step 1: Creating Python virtual environment...
python -m venv aquahub_env

echo.
echo Step 2: Activating virtual environment...
call aquahub_env\Scripts\activate.bat

echo.
echo Step 3: Installing Python dependencies...
pip install -r backend\requirements.txt

echo.
echo Step 4: Please run the following PostgreSQL commands manually:
echo.
echo   1. Open Command Prompt as Administrator
echo   2. Navigate to PostgreSQL bin directory (usually C:\Program Files\PostgreSQL\[version]\bin)
echo   3. Run: psql -U postgres
echo   4. Execute: \i "C:\Codex\AquaHub\PCL_final\database\create_database.sql"
echo   5. Execute: \i "C:\Codex\AquaHub\PCL_final\database\schema.sql"
echo   6. Execute: \i "C:\Codex\AquaHub\PCL_final\database\sample_data.sql"
echo.

echo Step 5: Configure environment variables...
echo   1. Copy backend\.env.example to backend\.env
echo   2. Update the database password in backend\.env

echo.
echo Setup instructions completed!
echo To start the backend server, run: python backend\app.py
pause
