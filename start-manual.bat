@echo off
REM =====================================================
REM CLOAKER v2.0 - INICIADOR ALTERNATIVO (fallback)
REM =====================================================
echo =====================================================
echo  CLOAKER v2.0 - INICIACAO
echo =====================================================
echo.

REM Opcao 1: Tenta dev server (recomendado)
echo [1] Tentando next dev...
call npm run dev

REM Se chegou aqui, o dev falhou. Tenta Express fallback.
echo.
echo !!! next dev náo conseguiu iniciar (possivel limitacao do ambiente)
echo    Tentando modo fallback com Express...
echo.

REM Opcao 2: Express fallback
call node server-fallback.js

echo.
echo Pressione qualquer tecla para sair.
pause > nul
