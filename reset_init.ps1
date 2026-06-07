# Reliable MySQL Password Reset using --init-file
Write-Output "Step 1: Stopping MySQL80 service..."
net stop MySQL80
Start-Sleep -s 2

Write-Output "Step 2: Killing any remaining mysqld processes..."
taskkill /F /IM mysqld.exe
Start-Sleep -s 2

Write-Output "Step 3: Creating init-file..."
$initFile = "$env:TEMP\mysql-init.txt"
"ALTER USER 'root'@'localhost' IDENTIFIED BY '12345678';" | Out-File -FilePath $initFile -Encoding ascii

Write-Output "Step 4: Launching MySQL with init-file to reset password..."
$proc = Start-Process -FilePath "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" -ArgumentList "--defaults-file=""C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"" --init-file=""$initFile"" --console" -PassThru -WindowStyle Hidden
Start-Sleep -s 10

Write-Output "Step 5: Stopping reset instance..."
Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
taskkill /F /IM mysqld.exe
Start-Sleep -s 2

Write-Output "Step 6: Starting MySQL80 service normally..."
net start MySQL80
Start-Sleep -s 2

Write-Output "Step 7: Cleaning up..."
Remove-Item $initFile -ErrorAction SilentlyContinue

Write-Output "Finished! Try connecting now."
