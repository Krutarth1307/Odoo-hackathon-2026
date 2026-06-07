# Reset MySQL password script
Write-Output "Stopping MySQL80 service..."
net stop MySQL80
Start-Sleep -s 3

Write-Output "Starting MySQL in skip-grant-tables mode..."
$mysqldProcess = Start-Process -FilePath "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" -ArgumentList "--skip-grant-tables --skip-networking" -PassThru -WindowStyle Hidden
Start-Sleep -s 5

Write-Output "Setting root password to 12345678..."
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345678'; FLUSH PRIVILEGES;"

Write-Output "Stopping recovery MySQL server..."
Stop-Process -Id $mysqldProcess.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Name mysqld -Force -ErrorAction SilentlyContinue
Start-Sleep -s 3

Write-Output "Restarting MySQL80 service..."
net start MySQL80
Start-Sleep -s 3

Write-Output "Verifying connection..."
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root --password=12345678 -e "SELECT 'SUCCESS!' AS Status;"

Start-Sleep -s 5
