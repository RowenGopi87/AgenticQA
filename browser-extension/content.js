// Content script for AgenticQA MCP Bridge
// This script runs on all web pages and listens for messages from AgenticQA

(function() {
    'use strict';

    // Listen for messages from the web page (AgenticQA)
    window.addEventListener('message', function(event) {
        // Only accept messages from the same origin
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'AGENTICQA_EXECUTE_TEST') {
            console.log('Received test execution request:', event.data);
            
            // Forward to background script
            chrome.runtime.sendMessage({
                type: 'EXECUTE_TEST_IN_CURSOR',
                test: event.data.test,
                prompt: event.data.prompt
            }, function(response) {
                // Send response back to the web page
                window.postMessage({
                    type: 'AGENTICQA_EXECUTION_RESPONSE',
                    success: response.success,
                    result: response.result,
                    error: response.error
                }, '*');
            });
        }
    });

    // Inject a bridge object into the page
    const script = document.createElement('script');
    script.textContent = `
        // Bridge object for AgenticQA to communicate with the extension
        window.AgenticQABridge = {
            executeTest: function(test, prompt) {
                return new Promise((resolve, reject) => {
                    const messageId = Date.now().toString();
                    
                    // Listen for response
                    const responseHandler = function(event) {
                        if (event.data.type === 'AGENTICQA_EXECUTION_RESPONSE' && 
                            event.data.messageId === messageId) {
                            window.removeEventListener('message', responseHandler);
                            
                            if (event.data.success) {
                                resolve(event.data.result);
                            } else {
                                reject(new Error(event.data.error));
                            }
                        }
                    };
                    
                    window.addEventListener('message', responseHandler);
                    
                    // Send message to content script
                    window.postMessage({
                        type: 'AGENTICQA_EXECUTE_TEST',
                        messageId: messageId,
                        test: test,
                        prompt: prompt
                    }, '*');
                    
                    // Timeout after 5 minutes
                    setTimeout(() => {
                        window.removeEventListener('message', responseHandler);
                        reject(new Error('Test execution timeout'));
                    }, 300000);
                });
            },
            
            isAvailable: function() {
                return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
            }
        };
        
        // Notify AgenticQA that the bridge is ready
        window.dispatchEvent(new CustomEvent('agenticqa-bridge-ready'));
    `;
    
    document.documentElement.appendChild(script);
    script.remove();
})(); 