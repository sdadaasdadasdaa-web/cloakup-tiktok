@echo off
REM =====================================================
REM CLOAKER GENÉRICO - INICIADOR COMPLETO
REM Build + servidor no mesmo processo (evita perca do .next)
REM =====================================================
echo =====================================================
echo  CLOAKER GENÉRICO - INICIACAO
echo =====================================================
echo.

REM Ativar shim do PATH (resolve spawn EPERM do Node no Windows)
set "PATH=C:\Users\User\Downloads\cloaker deep\shim-bin;%PATH%"

REM Build em seguida (mesmo processo, nao perde o .next)
echo Rodando build...
call npm run build

echo.
echo Iniciando servidor...
echo.
echo ACESSO:
echo   http://localhost:3000          -> vitrine
echo   http://localhost:3000/admin    -> painel de configuracao
echo   http://localhost:3000/health   -> health check
echo   http://localhost:3000/capture  -> landing de captura
echo.
echo Pressione Ctrl+C para parar.
echo.

npm start
