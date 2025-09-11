@echo off
echo Checking PostgreSQL Service Status...
echo.

echo Looking for PostgreSQL services...
sc query | findstr -i "postgresql"

echo.
echo Trying to start PostgreSQL service...
net start postgresql-x64-16 2>nul
if %errorlevel%==0 (
    echo ✅ PostgreSQL service started successfully!
) else (
    net start postgresql-x64-15 2>nul
    if %errorlevel%==0 (
        echo ✅ PostgreSQL service started successfully!
    ) else (
        net start postgresql-x64-14 2>nul
        if %errorlevel%==0 (
            echo ✅ PostgreSQL service started successfully!
        ) else (
            echo ❌ Could not start PostgreSQL service automatically.
            echo.
            echo Manual steps:
            echo 1. Press Win+R, type "services.msc" and press Enter
            echo 2. Find PostgreSQL service in the list
            echo 3. Right-click and select "Start"
            echo.
            echo Or try starting from Start Menu: PostgreSQL ^> Start Service
        )
    )
)

echo.
echo After starting PostgreSQL, run: python inspect_db.py
pause
