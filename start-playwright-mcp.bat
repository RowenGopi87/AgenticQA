@echo off
echo Starting Playwright MCP Server...
echo.
echo This will start the Playwright MCP server on port 8998
echo Press Ctrl+C to stop the server
echo.

REM Check if npx is available
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npx not found. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Start Playwright MCP server
echo Starting server...
npx @playwright/mcp@latest --port 8998

pause 