@echo off
setlocal EnableDelayedExpansion

echo ==========================================
echo   BUILD: Instalador Sistema Laboratorio
echo ==========================================

set "ELECTRON_DIR=%~dp0"
set "PACKAGE_DIR=%ELECTRON_DIR%.."
set "BACKEND_SRC=C:\Users\Usuario\Documents\backInventario\src"
set "FRONTEND_OUT=%ELECTRON_DIR%..\out"

REM ─── Verificaciones previas ────────────────────────────────────────────────

if not exist "%BACKEND_SRC%" (
  echo.
  echo ERROR: No se encontro el backend en:
  echo   %BACKEND_SRC%
  echo Verifique que el proyecto backInventario este en esa ruta.
  pause
  exit /b 1
)

if not exist "%ELECTRON_DIR%mongodb-bin\mongod.exe" (
  echo.
  echo ERROR: No se encontro mongod.exe
  echo Ejecute primero:  get-mongodb.bat
  echo.
  pause
  exit /b 1
)

REM ─── Paso 1: Compilar frontend Next.js ────────────────────────────────────
echo.
echo [1/5] Compilando frontend Next.js...
cd /d "%PACKAGE_DIR%"
call npm run build
if errorlevel 1 (
  echo.
  echo ERROR: Fallo la compilacion del frontend.
  pause
  exit /b 1
)

if not exist "%FRONTEND_OUT%\index.html" (
  echo.
  echo ERROR: No se genero la carpeta "out" con el frontend.
  echo Asegurese de que next.config.js tenga: output: 'export'
  pause
  exit /b 1
)

REM ─── Paso 2: Copiar frontend ───────────────────────────────────────────────
echo.
echo [2/5] Copiando frontend compilado...
if exist "%ELECTRON_DIR%frontend" rmdir /s /q "%ELECTRON_DIR%frontend"
xcopy /e /i /q "%FRONTEND_OUT%" "%ELECTRON_DIR%frontend"
if errorlevel 1 (
  echo ERROR: Fallo la copia del frontend.
  pause
  exit /b 1
)

REM ─── Paso 3: Copiar backend ───────────────────────────────────────────────
echo.
echo [3/5] Copiando backend...
if exist "%ELECTRON_DIR%backend" rmdir /s /q "%ELECTRON_DIR%backend"
xcopy /e /i /q "%BACKEND_SRC%" "%ELECTRON_DIR%backend"
if errorlevel 1 (
  echo ERROR: Fallo la copia del backend.
  pause
  exit /b 1
)

REM ─── Paso 3b: Inyectar módulos extras ────────────────────────────────────
echo.
echo [3b] Inyectando modulos extras (precios, configuracion)...
copy /y "%ELECTRON_DIR%backend-extras\models\PrecioExamen.js" "%ELECTRON_DIR%backend\models\PrecioExamen.js"
if errorlevel 1 ( echo ERROR: No se pudo copiar PrecioExamen.js & pause & exit /b 1 )
copy /y "%ELECTRON_DIR%backend-extras\routes\precioExamen.js" "%ELECTRON_DIR%backend\routes\precioExamen.js"
if errorlevel 1 ( echo ERROR: No se pudo copiar precioExamen.js & pause & exit /b 1 )
copy /y "%ELECTRON_DIR%backend-extras\models\Configuracion.js" "%ELECTRON_DIR%backend\models\Configuracion.js"
if errorlevel 1 ( echo ERROR: No se pudo copiar Configuracion.js & pause & exit /b 1 )
copy /y "%ELECTRON_DIR%backend-extras\routes\configuracion.js" "%ELECTRON_DIR%backend\routes\configuracion.js"
if errorlevel 1 ( echo ERROR: No se pudo copiar configuracion.js & pause & exit /b 1 )

REM Registrar ruta en app.js (via script para evitar problemas de escaping)
powershell -NoProfile -ExecutionPolicy Bypass -File "%ELECTRON_DIR%patch-app.ps1" -BackendDir "%ELECTRON_DIR%backend"
if errorlevel 1 ( echo ERROR: Fallo el parcheo de app.js & pause & exit /b 1 )

REM ─── Paso 4: Instalar dependencias ────────────────────────────────────────
echo.
echo [4/5] Instalando dependencias npm...
cd /d "%ELECTRON_DIR%"
call npm install --omit=dev
if errorlevel 1 (
  echo ERROR: Fallo npm install.
  pause
  exit /b 1
)

REM ─── Paso 5: Generar instalador ───────────────────────────────────────────
echo.
echo [5/5] Generando instalador .exe con electron-builder...
call npx electron-builder --win --x64
if errorlevel 1 (
  echo ERROR: Fallo la generacion del instalador.
  pause
  exit /b 1
)

echo.
echo ==========================================
echo   LISTO!
echo   Instalador en: electron-app\dist\
echo ==========================================
echo.
start "" "%ELECTRON_DIR%dist"
pause
