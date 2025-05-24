@echo off
echo ========================================
echo AgenticQA MCP Bridge Server Setup
echo ========================================
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies. Please ensure Node.js is installed.
    pause
    exit /b 1
)

echo.
echo Starting MCP Bridge Server...
echo.
echo The bridge server will enable automated test execution
echo between AgenticQA and Cursor's Playwright MCP.
echo.
echo Press Ctrl+C to stop the server.
echo.
echo ========================================
echo.

node mcp-bridge-server.js 