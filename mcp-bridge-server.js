const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const wss = new WebSocket.Server({ port: 3002 });

let mcpProcess = null;
let mcpReady = false;
const mcpRequestPromises = new Map(); // Store promises for MCP requests
let mcpBuffer = '';

function generateCommandId() {
    return `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

async function initializeMCP() {
    if (mcpProcess && !mcpProcess.killed) {
        console.log('MCP process attempt to initialize, but already running.');
        if (!mcpReady) console.warn('MCP process was running but not marked as ready. Check for issues.');
        return Promise.resolve(mcpProcess);
    }

    return new Promise((resolve, reject) => {
        console.log('Initializing Playwright MCP process via "npx @playwright/mcp@latest"...');
        mcpProcess = spawn('npx', ['@playwright/mcp@latest'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
            env: { ...process.env, NODE_ENV: 'development' } // Optional: for more verbose logs from MCP
        });

        mcpReady = false;
        mcpBuffer = '';
        mcpRequestPromises.clear();

        mcpProcess.stdout.on('data', (data) => {
            const outputChunk = data.toString();
            console.log('[MCP STDOUT]:', outputChunk);
            mcpBuffer += outputChunk;

            // Process buffer for complete JSON messages (newline-delimited)
            let newlineIndex;
            while ((newlineIndex = mcpBuffer.indexOf('\n')) >= 0) {
                const potentialJson = mcpBuffer.substring(0, newlineIndex).trim();
                mcpBuffer = mcpBuffer.substring(newlineIndex + 1);

                if (potentialJson) {
                    try {
                        const response = JSON.parse(potentialJson);
                        if (response.command_id && mcpRequestPromises.has(response.command_id)) {
                            const { resolveRequest, rejectRequest } = mcpRequestPromises.get(response.command_id);
                            if (response.error) {
                                console.error('MCP responded with error for command_id:', response.command_id, response.error);
                                rejectRequest(new Error(response.error.message || JSON.stringify(response.error)));
                            } else {
                                resolveRequest(response);
                            }
                            mcpRequestPromises.delete(response.command_id);
                        } else if (response.event === 'mcp_ready' || outputChunk.includes('Playwright MCP ready') || outputChunk.includes('MCP server listening')) {
                            // Generic readiness check (less reliable)
                            if (!mcpReady) {
                                console.log('Playwright MCP process indicated readiness.');
                                mcpReady = true;
                                broadcast({ type: 'bridge_status', mcpReady: true });
                                resolve(mcpProcess); // Resolve the outer initializeMCP promise
                            }
                        } else {
                            console.log('MCP STDOUT (unhandled JSON):', response);
                        }
                    } catch (e) {
                        console.warn('MCP STDOUT (non-JSON or partial JSON line):', potentialJson, 'Error:', e.message);
                    }
                }
            }
            // Simple keyword-based readiness (less reliable, but a fallback)
            if (!mcpReady && (outputChunk.includes('Playwright MCP ready') || outputChunk.includes('MCP server listening'))) {
                console.log('Playwright MCP process indicated readiness (keyword match).');
                mcpReady = true;
                broadcast({ type: 'bridge_status', mcpReady: true });
                resolve(mcpProcess); 
            }
        });

        mcpProcess.stderr.on('data', (data) => {
            console.error('[MCP STDERR]:', data.toString());
        });

        mcpProcess.on('error', (error) => {
            console.error('Failed to start MCP process:', error);
            mcpReady = false;
            broadcast({ type: 'bridge_status', mcpReady: false, error: 'MCP process failed to start' });
            reject(error);
        });

        mcpProcess.on('exit', (code, signal) => {
            console.log(`MCP process exited with code ${code}, signal ${signal}`);
            mcpReady = false;
            mcpProcess = null;
            mcpRequestPromises.forEach(({ rejectRequest }) => rejectRequest(new Error('MCP process exited.')));
            mcpRequestPromises.clear();
            broadcast({ type: 'bridge_status', mcpReady: false, error: 'MCP process exited' });
        });

        // Fallback readiness timer
        const readyTimeout = setTimeout(() => {
            if (!mcpReady) {
                console.warn('MCP readiness not confirmed by specific message after 7s, assuming ready if process is live.');
                if (mcpProcess && !mcpProcess.killed) {
                    mcpReady = true;
                    broadcast({ type: 'bridge_status', mcpReady: true });
                    resolve(mcpProcess);
                } else {
                    reject(new Error('MCP process not live after readiness timeout.'));
                }
            }
        }, 7000); // 7-second timeout for MCP to initialize

        // Ensure timeout is cleared if readiness is achieved earlier
        if (mcpReady) clearTimeout(readyTimeout);
    });
}

function parseTestSteps(prompt) {
    return prompt.split(/[.\n]/)
        .map(s => s.trim())
        .filter(s => s)
        .map((step, index) => ({ step_number: index + 1, action: step, options: { capture_screenshot: true } }));
}

async function executeTestWithMCP(testData) {
    if (!mcpReady || !mcpProcess || mcpProcess.killed) {
        await initializeMCP().catch(err => { 
            console.error("Failed to re-initialize MCP during executeTestWithMCP:", err);
            throw new Error('MCP process is not ready and could not be started.');
        });
        if (!mcpReady) throw new Error('MCP process is not ready after re-initialization attempt.');
    }

    const commandId = generateCommandId();
    const mcpPrompt = {
        command_id: commandId,
        command: 'run_playwright_test', // This is an assumption
        payload: {
            test_name: testData.name,
            test_module: testData.module,
            steps: parseTestSteps(testData.prompt),
            expected_results_description: testData.expectedResults,
            options: {
                capture_screenshots_for_steps: true,
                validate_results_against_description: true
            }
        }
    };

    return new Promise((resolveRequest, rejectRequest) => {
        mcpRequestPromises.set(commandId, { resolveRequest, rejectRequest });

        try {
            const promptString = JSON.stringify(mcpPrompt) + '\n';
            console.log(`[MCP STDIN] Sending for command_id ${commandId}:`, promptString.trim());
            mcpProcess.stdin.write(promptString);
        } catch (error) {
            console.error('Error writing to MCP stdin:', error);
            mcpRequestPromises.delete(commandId);
            rejectRequest(error);
            return;
        }

        setTimeout(() => {
            if (mcpRequestPromises.has(commandId)) {
                console.error(`Timeout waiting for MCP response for command_id: ${commandId}`);
                mcpRequestPromises.delete(commandId);
                rejectRequest(new Error('MCP response timeout for command: ' + commandId));
            }
        }, 35000); // 35-second timeout for test execution + MCP response
    }).then(response => {
        // Transform MCP response to the structure AgenticQA expects
        return {
            status: response.payload?.overall_status || 'unknown',
            executionTime: response.payload?.total_duration_ms || 0,
            screenshots: response.payload?.step_results?.map(sr => ({ 
                step: sr.step_number, 
                description: sr.action_performed || sr.action, // Prefer action_performed if available
                screenshotPath: sr.screenshot_path, 
                base64: sr.screenshot_base64,
                status: sr.status,
                duration_ms: sr.duration_ms,
                logs: sr.logs
            })) || [],
            logs: response.payload?.logs ? response.payload.logs.join('\n') : 'No overall logs from MCP.',
            validationResults: {
                passed: response.payload?.validation_outcome?.passed || false,
                details: response.payload?.validation_outcome?.details || 'No validation details.'
            }
        };
    });
}

app.post('/api/execute-test', async (req, res) => {
    const testData = req.body;
    if (!testData || !testData.id) {
        return res.status(400).json({ error: 'Invalid test data or missing test ID.'});
    }
    broadcast({ type: 'test_started', testId: testData.id, timestamp: new Date().toISOString() });
    try {
        const result = await executeTestWithMCP(testData);
        const response = {
            testId: testData.id,
            status: result.status,
            duration: result.executionTime,
            screenshots: result.screenshots,
            logs: result.logs,
            validationResults: result.validationResults,
            executedAt: new Date().toISOString()
        };
        broadcast({ type: 'test_completed', ...response });
        res.json(response);
    } catch (error) {
        console.error(`Test execution error for ${testData.id}:`, error.message);
        broadcast({ type: 'test_error', testId: testData.id, error: error.message, timestamp: new Date().toISOString() });
        res.status(500).json({ error: error.message, status: 'failed' });
    }
});

app.get('/api/status', (req, res) => {
    res.json({ status: 'running', mcpReady: mcpReady, timestamp: new Date().toISOString() });
});

wss.on('connection', (ws) => {
    console.log('New WebSocket connection. Sending current MCP status.');
    ws.send(JSON.stringify({ type: 'bridge_status', mcpReady: mcpReady }));
    ws.on('message', (message) => { console.log('Received from client (should be none):', message.toString()); });
    ws.on('close', () => { console.log('WebSocket connection closed'); });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

async function startServer() {
    app.listen(PORT, async () => {
        console.log(`MCP Bridge Server running on http://localhost:${PORT}`);
        console.log(`WebSocket server running on ws://localhost:3002`);
        try {
            await initializeMCP();
            console.log(`Initial MCP readiness: ${mcpReady}`);
            broadcast({ type: 'bridge_status', mcpReady: mcpReady });
        } catch (error) {
            console.error('Failed to initialize MCP on startup:', error.message);
            broadcast({ type: 'bridge_status', mcpReady: false, error: 'MCP initialization failed on startup' });
        }
    });
}

startServer();

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

function gracefulShutdown() {
    console.log('Shutting down gracefully...');
    if (mcpProcess && !mcpProcess.killed) {
        console.log('Sending SIGINT to MCP process...');
        mcpProcess.kill('SIGINT');
    }
    wss.close(() => {
        console.log('WebSocket server closed.');
        // Allow time for MCP to exit before force exiting process
        setTimeout(() => {
            console.log('Exiting process.');
            process.exit(0);
        }, 2000);
    });
} 