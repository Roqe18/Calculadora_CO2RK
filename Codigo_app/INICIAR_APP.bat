@echo off
title Plataforma Digital para Proyectos de Absorcion de Carbono - IDAF
cd /d "%~dp0"
echo =========================================================================
echo   Iniciando Plataforma Digital para Proyectos de Absorcion de Carbono
echo   IDAF - Centro de Investigaciones Agroforestales
echo =========================================================================
echo.
where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    py server\dev_server.py
) else (
    python server\dev_server.py
)
if %ERRORLEVEL% neq 0 (
    echo.
    echo Error al iniciar. Presiona una tecla para salir.
    pause
)
