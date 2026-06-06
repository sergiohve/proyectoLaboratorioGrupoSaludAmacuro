@echo off
setlocal EnableDelayedExpansion

echo ==========================================
echo   Descargando MongoDB para Windows x64
echo ==========================================
echo.

set "ELECTRON_DIR=%~dp0"
set "MONGO_DIR=%ELECTRON_DIR%mongodb-bin"
set "MONGO_ZIP=%TEMP%\mongodb-windows.zip"
set "MONGO_EXTRACT=%TEMP%\mongodb-extract"
set "MONGO_URL=https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-6.0.20.zip"

REM Verificar si ya existe
if exist "%MONGO_DIR%\mongod.exe" (
  echo mongod.exe ya existe en:
  echo   %MONGO_DIR%\mongod.exe
  echo.
  echo Si quiere volver a descargarlo, elimine ese archivo primero.
  pause
  exit /b 0
)

if not exist "%MONGO_DIR%" mkdir "%MONGO_DIR%"

echo Descargando MongoDB 6.0 Community para Windows x64...
echo URL: %MONGO_URL%
echo Esto puede tardar varios minutos dependiendo de su conexion.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "[Net.ServicePointManager]::SecurityProtocol = 'Tls12,Tls13';" ^
  "$ProgressPreference = 'SilentlyContinue';" ^
  "Write-Host 'Descargando...';" ^
  "Invoke-WebRequest -Uri '%MONGO_URL%' -OutFile '%MONGO_ZIP%';" ^
  "Write-Host 'Descarga completada.'"

if not exist "%MONGO_ZIP%" (
  echo.
  echo ERROR: No se pudo descargar MongoDB.
  echo Verifique su conexion a internet e intente de nuevo.
  pause
  exit /b 1
)

echo.
echo Extrayendo archivo...
if exist "%MONGO_EXTRACT%" rmdir /s /q "%MONGO_EXTRACT%"
mkdir "%MONGO_EXTRACT%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ProgressPreference = 'SilentlyContinue';" ^
  "Expand-Archive -Path '%MONGO_ZIP%' -DestinationPath '%MONGO_EXTRACT%' -Force;" ^
  "Write-Host 'Extraccion completada.'"

echo.
echo Copiando mongod.exe...

REM Buscar mongod.exe dentro del directorio extraido
set "FOUND=0"
for /d %%D in ("%MONGO_EXTRACT%\*") do (
  if exist "%%D\bin\mongod.exe" (
    copy /y "%%D\bin\mongod.exe" "%MONGO_DIR%\mongod.exe" >nul
    set "FOUND=1"
    goto :copy_done
  )
)

:copy_done
if "%FOUND%"=="0" (
  echo ERROR: No se encontro mongod.exe en el ZIP descargado.
  echo Intente descargar manualmente desde: https://www.mongodb.com/try/download/community
  rmdir /s /q "%MONGO_EXTRACT%" 2>nul
  del "%MONGO_ZIP%" 2>nul
  pause
  exit /b 1
)

echo Limpiando archivos temporales...
del "%MONGO_ZIP%" 2>nul
rmdir /s /q "%MONGO_EXTRACT%" 2>nul

echo.
echo ==========================================
echo   MongoDB listo!
echo   Ubicacion: %MONGO_DIR%\mongod.exe
echo.
echo   Ahora puede ejecutar: build.bat
echo ==========================================
pause
