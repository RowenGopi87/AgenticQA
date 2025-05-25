// Cursor API Integration Module
// This module attempts to communicate directly with Cursor IDE's local API

(function() {
    'use strict';

    // Cursor API Integration
    window.CursorAPI = {
        // Configuration
        config: {
            apiUrl: 'http://localhost:42000',
            timeout: 30000,
            retryAttempts: 3
        },

        // Check if Cursor API is available
        isAvailable: async function() {
            try {
                const response = await fetch(`${this.config.apiUrl}/api/status`, {
                    method: 'GET',
                    timeout: 5000
                });
                return response.ok;
            } catch (error) {
                console.log('Cursor API not available:', error.message);
                return false;
            }
        },

        // Send message to Cursor chat
        sendToChat: async function(message, options = {}) {
            try {
                const response = await fetch(`${this.config.apiUrl}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        autoExecute: options.autoExecute || false,
                        context: options.context || {},
                        timeout: options.timeout || this.config.timeout
                    })
                });

                if (!response.ok) {
                    throw new Error(`Cursor API responded with ${response.status}`);
                }

                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Failed to send message to Cursor:', error);
                throw error;
            }
        },

        // Execute test with polling for results
        executeTest: async function(testData) {
            const { prompt, metadata } = testData;
            
            try {
                // Send test to Cursor
                const chatResponse = await this.sendToChat(prompt, {
                    autoExecute: true,
                    context: {
                        type: 'agenticqa_test',
                        testId: metadata.testId,
                        executionId: metadata.executionId
                    }
                });

                if (chatResponse.executionId) {
                    // Poll for results
                    return await this.pollForResults(chatResponse.executionId);
                } else {
                    // Return immediate response
                    return this.formatResponse(chatResponse);
                }
                
            } catch (error) {
                console.error('Cursor test execution failed:', error);
                throw error;
            }
        },

        // Poll for execution results
        pollForResults: async function(executionId) {
            const startTime = Date.now();
            const pollInterval = 2000; // 2 seconds
            
            while (Date.now() - startTime < this.config.timeout) {
                try {
                    const response = await fetch(`${this.config.apiUrl}/api/execution/${executionId}`, {
                        method: 'GET'
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to get execution status: ${response.status}`);
                    }

                    const result = await response.json();
                    
                    if (result.status !== 'in_progress') {
                        return this.formatResponse(result);
                    }
                    
                    // Wait before next poll
                    await new Promise(resolve => setTimeout(resolve, pollInterval));
                    
                } catch (error) {
                    console.error('Error polling for results:', error);
                    throw error;
                }
            }
            
            throw new Error('Test execution timed out');
        },

        // Format response to match AgenticQA format
        formatResponse: function(cursorResponse) {
            return {
                status: this.mapStatus(cursorResponse.status),
                duration: cursorResponse.duration || 0,
                steps: this.formatSteps(cursorResponse.steps || []),
                screenshots: cursorResponse.screenshots || [],
                logs: cursorResponse.logs || [],
                validationResults: cursorResponse.validation || null,
                error: cursorResponse.error || null
            };
        },

        // Map Cursor status to AgenticQA status
        mapStatus: function(cursorStatus) {
            const statusMap = {
                'success': 'passed',
                'completed': 'passed',
                'failure': 'failed',
                'error': 'failed',
                'timeout': 'blocked',
                'cancelled': 'blocked'
            };
            return statusMap[cursorStatus] || cursorStatus;
        },

        // Format test steps
        formatSteps: function(cursorSteps) {
            return cursorSteps.map((step, index) => ({
                stepNumber: index + 1,
                action: step.action || step.description,
                status: this.mapStatus(step.status),
                duration: step.duration,
                screenshot: step.screenshot,
                logs: step.logs || [],
                error: step.error
            }));
        },

        // Initialize Cursor API integration
        init: async function(config) {
            if (config) {
                Object.assign(this.config, config);
            }
            
            const available = await this.isAvailable();
            
            if (available) {
                console.log('Cursor API integration initialized successfully');
            } else {
                console.log('Cursor API not available. Using fallback methods.');
            }
            
            return available;
        }
    };

    // Auto-initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        window.CursorAPI.init();
    });

})(); 