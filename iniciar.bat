@echo off
chcp 65001 >nul
title Traço & Pixel - Laboratório de Computação Visual
color 0F

echo ========================================================
echo          TRAÇO & PIXEL - ESTÚDIO DE RASTERIZAÇÃO
echo ========================================================
echo.

:: 1. Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Node.js não foi encontrado no sistema!
    echo Por favor, instale o Node.js em: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Verificar dependências (node_modules)
if not exist "node_modules\" (
    echo [INFO] Primeira execução detectada. Instalando dependências...
    echo Isso pode levar alguns instantes. Aguarde...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERRO] Falha ao instalar dependências.
        pause
        exit /b 1
    )
    echo [OK] Dependências instaladas com sucesso!
    echo.
)

:: 3. Liberar porta 3000 se houver processo Next.js anterior preso
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>nul

:: 4. Informar o usuário e abrir no navegador
echo [INFO] Iniciando o servidor de desenvolvimento...
echo [INFO] O projeto estará disponível em: http://localhost:3000
echo.
echo Dica: Pressione Ctrl+C nesta janela para encerrar o servidor.
echo ========================================================
echo.

:: Abrir navegador automaticamente após breve pausa
start "" /b cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: 5. Executar o Next.js dev server
call npm run dev

pause
