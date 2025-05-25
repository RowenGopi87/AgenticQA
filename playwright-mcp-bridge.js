const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');

const app = express();
app.use(cors());
app.use(express.json());

let mcpClient = null;
let mcpProcess = null;

// Initialize MCP client
async function initializeMCP() {
    try {
        // Spawn Playwright MCP server
        mcpProcess = spawn('npx', ['@playwright/mcp@latest'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        // Create transport
        const transport = new StdioClientTransport({
            command: 'npx',
            args: ['@playwright/mcp@latest'],
            env: process.env
        });

        // Create client
        mcpClient = new Client({
            name: 'playwright-mcp-bridge',
            version: '1.0.0'
        }, {
            capabilities: {
                tools: { listChanged: true },
                resources: { listChanged: true }
            }
        });

        // Connect
        await mcpClient.connect(transport);
        
        console.log('MCP client connected successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize MCP:', error);
        return false;
    }
}

// Status endpoint
app.get('/status', async (req, res) => {
    res.json({ 
        status: mcpClient ? 'connected' : 'disconnected',
        server: 'playwright-mcp-bridge'
    });
});

// Execute test endpoint
app.post('/execute', async (req, res) => {
    if (!mcpClient) {
        return res.status(503).json({ error: 'MCP client not connected' });
    }

    try {
        const { testSteps } = req.body;
        const results = {
            status: 'passed',
            steps: [],
            screenshots: [],
            duration: 0
        };

        const startTime = Date.now();

        for (const step of testSteps) {
            const stepResult = {
                action: step.description,
                status: 'passed',
                logs: []
            };

            try {
                switch (step.type) {
                    case 'navigate':
                        await mcpClient.callTool('browser_navigate', {
                            url: step.url
                        });
                        stepResult.logs.push(`Navigated to ${step.url}`);
                        break;

                    case 'click':
                        // First get snapshot to find element
                        const snapshot = await mcpClient.callTool('browser_snapshot', {});
                        // In real implementation, parse snapshot to find element ref
                        await mcpClient.callTool('browser_click', {
                            element: step.element,
                            ref: step.element // Simplified - would need proper ref lookup
                        });
                        stepResult.logs.push(`Clicked on ${step.element}`);
                        break;

                    case 'type':
                        await mcpClient.callTool('browser_type', {
                            element: step.element,
                            ref: step.element, // Simplified
                            text: step.text
                        });
                        stepResult.logs.push(`Typed "${step.text}" into ${step.element}`);
                        break;

                    case 'wait':
                        await mcpClient.callTool('browser_wait_for', {
                            time: step.time
                        });
                        stepResult.logs.push(`Waited for ${step.time} seconds`);
                        break;

                    case 'screenshot':
                        const screenshot = await mcpClient.callTool('browser_take_screenshot', {
                            raw: false
                        });
                        if (screenshot.content && screenshot.content[0]) {
                            results.screenshots.push(screenshot.content[0].data);
                            stepResult.screenshot = screenshot.content[0].data;
                        }
                        stepResult.logs.push('Captured screenshot');
                        break;
                }
            } catch (error) {
                stepResult.status = 'failed';
                stepResult.error = error.message;
                results.status = 'failed';
            }

            results.steps.push(stepResult);
        }

        results.duration = Date.now() - startTime;
        res.json(results);

    } catch (error) {
        console.error('Execution error:', error);
        res.status(500).json({ error: error.message });
    }
});

// List available tools
app.get('/tools', async (req, res) => {
    if (!mcpClient) {
        return res.status(503).json({ error: 'MCP client not connected' });
    }

    try {
        const tools = await mcpClient.listTools();
        res.json(tools);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    console.log(`Playwright MCP Bridge running on port ${PORT}`);
    await initializeMCP();
});

// Cleanup on exit
process.on('SIGINT', () => {
    if (mcpProcess) {
        mcpProcess.kill();
    }
    process.exit();
}); 