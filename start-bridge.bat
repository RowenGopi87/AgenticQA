@echo off
echo Starting Playwright MCP Bridge Server...
echo.
echo This bridge allows AgenticQA to communicate with Playwright MCP
echo The bridge will run on http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js not found. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm not found. Please install Node.js/npm first.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start the bridge server
echo Starting bridge server...
node playwright-mcp-bridge.js

pause 