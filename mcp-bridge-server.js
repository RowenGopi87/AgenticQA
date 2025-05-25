const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 3002 });

// Store active MCP connections
const mcpConnections = new Map();

// Initialize MCP connection
async function initializeMCP() {
    return new Promise((resolve, reject) => {
        try {
            // Spawn the MCP server
            const mcpProcess = spawn('npx', ['@playwright/mcp@latest'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            let output = '';
            
            mcpProcess.stdout.on('data', (data) => {
                output += data.toString();
                console.log('MCP Output:', data.toString());
            });

            mcpProcess.stderr.on('data', (data) => {
                console.error('MCP Error:', data.toString());
            });

            mcpProcess.on('error', (error) => {
                console.error('Failed to start MCP:', error);
                reject(error);
            });

            // Give MCP time to initialize
            setTimeout(() => {
                resolve(mcpProcess);
            }, 2000);

        } catch (error) {
            reject(error);
        }
    });
}

// Execute test through MCP
async function executeTestWithMCP(testData) {
    try {
        // Create a structured prompt for the MCP agent
        const mcpPrompt = {
            action: "execute_playwright_test",
            testName: testData.name,
            testType: testData.type,
            module: testData.module,
            steps: parseTestSteps(testData.prompt),
            expectedResults: testData.expectedResults,
            captureScreenshots: true,
            validateResults: true
        };

        // Send to MCP and get results
        const result = await sendToMCP(mcpPrompt);
        return result;
    } catch (error) {
        console.error('MCP execution error:', error);
        throw error;
    }
}

// Parse test prompt into structured steps
function parseTestSteps(prompt) {
    // Simple parsing - in production, you'd want more sophisticated parsing
    const steps = prompt.split('.').filter(s => s.trim()).map(s => s.trim());
    return steps.map((step, index) => ({
        stepNumber: index + 1,
        action: step,
        screenshot: true
    }));
}

// Send prompt to MCP and handle response
async function sendToMCP(prompt) {
    return new Promise((resolve, reject) => {
        // Simulate MCP execution - replace with actual MCP API calls
        const startTime = Date.now();
        
        // In real implementation, this would communicate with the MCP process
        setTimeout(() => {
            const executionTime = Date.now() - startTime;
            
            // Simulated response - replace with actual MCP response
            const result = {
                status: 'passed', // or 'failed', 'blocked'
                executionTime: executionTime,
                screenshots: [
                    {
                        step: 1,
                        description: "Navigate to page",
                        screenshotPath: "screenshot1.png",
                        base64: null // Would contain actual screenshot
                    },
                    {
                        step: 2,
                        description: "Perform action",
                        screenshotPath: "screenshot2.png",
                        base64: null
                    }
                ],
                logs: "Test executed successfully",
                validationResults: {
                    passed: true,
                    details: "All expected results matched"
                }
            };
            
            resolve(result);
        }, 3000);
    });
}

// Enhanced execute test endpoint
app.post('/api/execute-test', async (req, res) => {
    try {
        const testData = req.body;
        
        // Broadcast test start to WebSocket clients
        broadcast({
            type: 'test_started',
            testId: testData.id,
            timestamp: new Date().toISOString()
        });

        // Note: Cursor opening is handled by the client side now
        // This endpoint focuses on MCP execution simulation

        // Execute test with MCP
        const result = await executeTestWithMCP(testData);
        
        // Prepare response
        const response = {
            testId: testData.id,
            status: result.status,
            duration: result.executionTime,
            screenshots: result.screenshots,
            logs: result.logs,
            validationResults: result.validationResults,
            executedAt: new Date().toISOString()
        };

        // Broadcast test completion
        broadcast({
            type: 'test_completed',
            ...response
        });

        res.json(response);
    } catch (error) {
        console.error('Test execution error:', error);
        res.status(500).json({ 
            error: error.message,
            status: 'failed'
        });
    }
});

// API endpoint to check server status
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'running',
        mcpAvailable: mcpConnections.size > 0,
        timestamp: new Date().toISOString()
    });
});

// API endpoint to open Cursor IDE with prompt
app.post('/api/open-cursor', async (req, res) => {
    try {
        const { testPrompt } = req.body;
        const { exec } = require('child_process');
        const fs = require('fs').promises;
        const os = require('os');
        const path = require('path');
        
        // Method 1: Try to open Cursor with a temporary file containing the prompt
        if (testPrompt) {
            try {
                // Create a temporary file with the prompt
                const tempDir = os.tmpdir();
                const promptFile = path.join(tempDir, `agenticqa-prompt-${Date.now()}.md`);
                
                // Format the prompt as a markdown file that Cursor might recognize
                const promptContent = `# AgenticQA Test Execution Request

${testPrompt}

---
Generated by AgenticQA at ${new Date().toISOString()}
`;
                
                await fs.writeFile(promptFile, promptContent, 'utf8');
                console.log('Created prompt file:', promptFile);
                
                // Try to open Cursor with the file
                const cursorPaths = [
                    { 
                        path: 'cursor',
                        args: [promptFile]
                    },
                    { 
                        path: 'C:\\Users\\rowen\\AppData\\Local\\Programs\\cursor\\Cursor.exe',
                        args: [promptFile]
                    },
                    { 
                        path: '/Applications/Cursor.app/Contents/MacOS/Cursor',
                        args: [promptFile]
                    },
                    { 
                        path: '/usr/bin/cursor',
                        args: [promptFile]
                    }
                ];

                let opened = false;
                for (const cursor of cursorPaths) {
                    try {
                        // Try opening with the prompt file
                        exec(`"${cursor.path}" ${cursor.args.join(' ')}`, (error) => {
                            if (!error) {
                                console.log(`Opened Cursor with prompt file using: ${cursor.path}`);
                                opened = true;
                                
                                // Clean up the file after a delay
                                setTimeout(() => {
                                    fs.unlink(promptFile).catch(err => 
                                        console.error('Error deleting prompt file:', err)
                                    );
                                }, 10000); // Delete after 10 seconds
                            }
                        });
                        
                        if (opened) break;
                    } catch (e) {
                        // Try next path
                    }
                }
                
                // Method 2: Try using cursor:// protocol if available
                if (!opened) {
                    try {
                        // Attempt to use a cursor:// URL scheme if it exists
                        const encodedPrompt = encodeURIComponent(testPrompt);
                        const cursorUrl = `cursor://agent?prompt=${encodedPrompt}`;
                        
                        exec(`start "${cursorUrl}"`, (error) => {
                            if (!error) {
                                console.log('Opened Cursor with URL scheme');
                                opened = true;
                            }
                        });
                    } catch (e) {
                        console.error('URL scheme failed:', e);
                    }
                }
                
                if (opened) {
                    res.json({ 
                        success: true, 
                        message: 'Cursor IDE opened with prompt',
                        method: 'file',
                        promptFile: promptFile
                    });
                } else {
                    res.json({ 
                        success: false, 
                        message: 'Could not open Cursor IDE with prompt, falling back to clipboard',
                        suggestion: 'Please paste the prompt manually in Cursor Agent Mode'
                    });
                }
            } catch (fileError) {
                console.error('Error creating prompt file:', fileError);
                res.json({ 
                    success: false, 
                    message: 'Error preparing prompt for Cursor',
                    error: fileError.message 
                });
            }
        } else {
            // No prompt provided, just try to open Cursor
            const cursorPaths = [
                'cursor',
                'C:\\Users\\rowen\\AppData\\Local\\Programs\\cursor\\Cursor.exe',
                '/Applications/Cursor.app/Contents/MacOS/Cursor',
                '/usr/bin/cursor'
            ];

            let opened = false;
            for (const cursorPath of cursorPaths) {
                try {
                    exec(cursorPath, (error) => {
                        if (!error) {
                            opened = true;
                        }
                    });
                    if (opened) break;
                } catch (e) {
                    // Try next path
                }
            }

            if (opened) {
                res.json({ success: true, message: 'Cursor IDE opened' });
            } else {
                res.json({ success: false, message: 'Could not open Cursor IDE automatically' });
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message) => {
        console.log('Received:', message);
    });
    
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Broadcast to all WebSocket clients
function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Start server
app.listen(PORT, async () => {
    console.log(`MCP Bridge Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server running on ws://localhost:3002`);
    
    // Try to initialize MCP connection
    try {
        const mcp = await initializeMCP();
        mcpConnections.set('default', mcp);
        console.log('MCP connection initialized');
    } catch (error) {
        console.error('Failed to initialize MCP:', error);
    }
});

// Cleanup on exit
process.on('SIGINT', () => {
    console.log('Shutting down...');
    mcpConnections.forEach((mcp) => {
        mcp.kill();
    });
    process.exit();
}); 