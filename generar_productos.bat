@echo off
echo ========================================
echo   Generador de Productos de Muestra
echo ========================================
echo.

echo Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no esta instalado o no esta en el PATH
    echo Por favor instala Python desde https://python.org
    pause
    exit /b 1
)

echo Verificando dependencias...
pip show pandas >nul 2>&1
if errorlevel 1 (
    echo Instalando dependencias...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
)

echo.
echo Ejecutando generador de productos...
python generar_productos.py

echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
