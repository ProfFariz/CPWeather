@echo off
setlocal
set "ROOT=%~dp0"
set "NODE_DIR=%ROOT%.tools\node-v22.22.2-win-x64"
set "COREPACK_HOME=%ROOT%.tools\corepack"
set "PATH=%NODE_DIR%;%PATH%"

if not exist "%NODE_DIR%\node.exe" (
  echo Node 22 was not found at "%NODE_DIR%".
  exit /b 1
)

if "%~1"=="" (
  node -v
  exit /b %ERRORLEVEL%
)

%*
