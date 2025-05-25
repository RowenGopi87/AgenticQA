// Background service worker for AgenticQA MCP Bridge

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXECUTE_TEST_IN_CURSOR') {
    // Execute test in Cursor IDE
    executeTestInCursor(request.test, request.prompt)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

// Execute test in Cursor IDE
async function executeTestInCursor(test, prompt) {
  try {
    // Method 1: Try to communicate with Cursor via local API (if available)
    const cursorResult = await tryLocalCursorAPI(prompt);
    if (cursorResult) {
      return cursorResult;
    }
    
    // Method 2: Use clipboard and notification approach
    await copyToClipboardAndNotify(prompt);
    
    // Return instructions for manual execution
    return {
      status: 'manual_execution_required',
      message: 'Prompt copied to clipboard. Please paste in Cursor Chat (Ctrl+I)',
      prompt: prompt
    };
    
  } catch (error) {
    console.error('Failed to execute test in Cursor:', error);
    throw error;
  }
}

// Try to communicate with Cursor via local API
async function tryLocalCursorAPI(prompt) {
  try {
    // Check if Cursor has a local API endpoint
    const response = await fetch('http://localhost:42000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        autoExecute: true
      })
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.log('Cursor local API not available:', error.message);
  }
  
  return null;
}

// Copy to clipboard and show notification
async function copyToClipboardAndNotify(prompt) {
  try {
    // Copy to clipboard
    await navigator.clipboard.writeText(prompt);
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'AgenticQA Test Ready',
      message: 'Test prompt copied to clipboard. Open Cursor Chat (Ctrl+I) and paste to execute.',
      buttons: [
        { title: 'Open Cursor' },
        { title: 'Dismiss' }
      ]
    });
    
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // Try to open Cursor (this may not work due to security restrictions)
    chrome.tabs.create({ url: 'cursor://open' }).catch(() => {
      // Fallback: show instructions
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Open Cursor Manually',
        message: 'Please open Cursor IDE and press Ctrl+I to open chat, then paste the prompt.'
      });
    });
  }
  
  chrome.notifications.clear(notificationId);
});

// Listen for connections from web pages
chrome.runtime.onConnect.addListener((port) => {
  console.log('Connected to', port.name);
  
  port.onMessage.addListener((msg) => {
    if (msg.type === 'CHECK_CURSOR_STATUS') {
      checkCursorStatus().then(status => {
        port.postMessage({ type: 'CURSOR_STATUS', status });
      });
    }
  });
});

// Check if Cursor is available
async function checkCursorStatus() {
  try {
    const response = await fetch('http://localhost:42000/api/status');
    return response.ok;
  } catch (error) {
    return false;
  }
} 