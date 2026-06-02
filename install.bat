@echo off
REM Instalar dependencias del proyecto
echo Installing dependencies...
npm install

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✅ Instalación completada!
  echo.
  echo Para iniciar el desarrollo, ejecuta:
  echo npm run dev
  echo.
  pause
) else (
  echo.
  echo ❌ Error durante la instalación
  echo.
  pause
)
