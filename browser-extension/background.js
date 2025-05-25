// Background service worker for AgenticQA MCP Bridge

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXECUTE_TEST') {
    // Forward the test to Playwright MCP
    executeTestWithMCP(request.test)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

// Execute test using Playwright MCP
async function executeTestWithMCP(test) {
  try {
    // Connect to local Playwright MCP server
    const response = await fetch('http://localhost:3000/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: test.prompt,
        expectedResults: test.expectedResults,
        metadata: {
          name: test.name,
          module: test.module,
          type: test.type
        }
      })
    });

    if (!response.ok) {
      throw new Error(`MCP server responded with ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to execute test with MCP:', error);
    throw error;
  }
}

// Listen for connections from web pages
chrome.runtime.onConnect.addListener((port) => {
  console.log('Connected to', port.name);
  
  port.onMessage.addListener((msg) => {
    if (msg.type === 'CHECK_MCP_STATUS') {
      checkMCPStatus().then(status => {
        port.postMessage({ type: 'MCP_STATUS', status });
      });
    }
  });
});

// Check if MCP server is running
async function checkMCPStatus() {
  try {
    const response = await fetch('http://localhost:3000/status');
    return response.ok;
  } catch (error) {
    return false;
  }
} 