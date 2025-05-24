#!/bin/bash

echo "========================================"
echo "AgenticQA MCP Bridge Server Setup"
echo "========================================"
echo ""

echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies. Please ensure Node.js is installed."
    exit 1
fi

echo ""
echo "Starting MCP Bridge Server..."
echo ""
echo "The bridge server will enable automated test execution"
echo "between AgenticQA and Cursor's Playwright MCP."
echo ""
echo "Press Ctrl+C to stop the server."
echo ""
echo "========================================"
echo ""

node mcp-bridge-server.js 