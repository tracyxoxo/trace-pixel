@echo off
setlocal
cd /d "%~dp0"
title Traco e Pixel - Estudio de Rasterizacao
color 0F

echo ========================================================
echo          TRACO E PIXEL - ESTUDIO DE RASTERIZACAO
echo ========================================================
echo.

REM 1. Verificar se o Node.js esta instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Node.js nao foi encontrado no sistema!
    echo Por favor, instale o Node.js em: https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM 2. Verificar dependencias (node_modules)
if not exist "node_modules\" (
    echo [INFO] Primeira execucao detectada. Instalando dependencias...
    echo Isso pode levar alguns instantes. Aguarde...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERRO] Falha ao instalar dependencias com npm install.
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas com sucesso!
    echo.
)

REM 3. Liberar porta 3000 se houver processo preso
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>nul

REM 4. Informar o usuario
echo [INFO] Iniciando o servidor de desenvolvimento...
echo [INFO] O projeto estara disponivel em: http://localhost:3000
echo.
echo Dica: Pressione Ctrl+C nesta janela para encerrar o servidor.
echo ========================================================
echo.

REM 5. Abrir navegador automaticamente
start "" http://localhost:3000

REM 6. Executar o Next.js dev server
call npm run dev

pause
