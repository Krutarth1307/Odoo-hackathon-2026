@echo off
setlocal
set MYSQL="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
set MYSQLD="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
set MYSQLADMIN="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqladmin.exe"
set DATADIR=C:\ProgramData\MySQL\MySQL Server 8.0\Data
set INITFILE=%TEMP%\mysql_init.sql

echo [Step 1] Creating password reset SQL file...
echo ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345678'; > %INITFILE%
echo FLUSH PRIVILEGES; >> %INITFILE%

echo [Step 2] Stopping MySQL80 service...
net stop MySQL80 >nul 2>&1
timeout /t 3 >nul

echo [Step 3] Starting MySQL with skip-grant-tables...
start /B "" %MYSQLD% --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --skip-grant-tables --skip-networking
timeout /t 5 >nul

echo [Step 4] Flushing privileges and setting new password...
%MYSQL% -u root --skip-password -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345678'; FLUSH PRIVILEGES;" 2>&1

echo [Step 5] Stopping temporary MySQL instance...
taskkill /F /IM mysqld.exe >nul 2>&1
timeout /t 3 >nul

echo [Step 6] Starting MySQL80 service normally...
net start MySQL80
timeout /t 4 >nul

echo [Step 7] Testing new password...
%MYSQL% -u root --password=12345678 -e "SELECT 'SUCCESS: Password is now 12345678' AS Result;" 2>&1

echo.
echo If you see SUCCESS above - you are done!
echo.
del %INITFILE% >nul 2>&1
pause
