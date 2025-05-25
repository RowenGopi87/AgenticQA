// AgenticQA MCP Integration Module
// This module provides direct integration with Playwright MCP

(function() {
    'use strict';

    // MCP Integration API
    window.AgenticQAMCP = {
        // Configuration
        config: {
            mcpServerUrl: 'http://localhost:3000',
            timeout: 60000, // 60 seconds timeout for test execution
            checkInterval: 1000 // Check status every second
        },

        // Check if MCP server is available
        isAvailable: async function() {
            try {
                const response = await fetch(`${this.config.mcpServerUrl}/status`, {
                    method: 'GET',
                    mode: 'cors'
                });
                return response.ok;
            } catch (error) {
                console.log('MCP server not available:', error.message);
                return false;
            }
        },

        // Execute a test through MCP
        executeTest: async function(testData) {
            const { prompt, metadata } = testData;
            
            try {
                // Start test execution
                const startResponse = await fetch(`${this.config.mcpServerUrl}/execute`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    body: JSON.stringify({
                        prompt: prompt,
                        options: {
                            headless: false, // Run in visible browser
                            timeout: this.config.timeout,
                            screenshot: true,
                            video: false
                        },
                        metadata: metadata
                    })
                });

                if (!startResponse.ok) {
                    throw new Error(`Failed to start test: ${startResponse.statusText}`);
                }

                const { executionId } = await startResponse.json();
                
                // Poll for results
                return await this.pollForResults(executionId);
                
            } catch (error) {
                console.error('MCP test execution failed:', error);
                throw error;
            }
        },

        // Poll for test execution results
        pollForResults: async function(executionId) {
            const startTime = Date.now();
            
            while (Date.now() - startTime < this.config.timeout) {
                try {
                    const response = await fetch(`${this.config.mcpServerUrl}/execution/${executionId}`, {
                        method: 'GET',
                        mode: 'cors'
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to get execution status: ${response.statusText}`);
                    }

                    const result = await response.json();
                    
                    if (result.status !== 'in_progress') {
                        // Test completed
                        return this.formatResults(result);
                    }
                    
                    // Wait before next poll
                    await new Promise(resolve => setTimeout(resolve, this.config.checkInterval));
                    
                } catch (error) {
                    console.error('Error polling for results:', error);
                    throw error;
                }
            }
            
            throw new Error('Test execution timed out');
        },

        // Format MCP results to match AgenticQA format
        formatResults: function(mcpResult) {
            return {
                status: this.mapStatus(mcpResult.status),
                duration: mcpResult.duration,
                steps: this.formatSteps(mcpResult.steps || []),
                screenshots: this.extractScreenshots(mcpResult),
                logs: mcpResult.logs || [],
                validationResults: mcpResult.validation || null,
                error: mcpResult.error || null
            };
        },

        // Map MCP status to AgenticQA status
        mapStatus: function(mcpStatus) {
            const statusMap = {
                'success': 'passed',
                'failure': 'failed',
                'error': 'failed',
                'timeout': 'blocked',
                'skipped': 'blocked'
            };
            return statusMap[mcpStatus] || mcpStatus;
        },

        // Format test steps
        formatSteps: function(mcpSteps) {
            return mcpSteps.map((step, index) => ({
                stepNumber: index + 1,
                action: step.action || step.description,
                status: this.mapStatus(step.status),
                duration: step.duration,
                screenshot: step.screenshot,
                logs: step.logs || [],
                error: step.error
            }));
        },

        // Extract screenshots from results
        extractScreenshots: function(mcpResult) {
            const screenshots = [];
            
            // Add main screenshot if available
            if (mcpResult.screenshot) {
                screenshots.push(mcpResult.screenshot);
            }
            
            // Add step screenshots
            if (mcpResult.steps) {
                mcpResult.steps.forEach(step => {
                    if (step.screenshot) {
                        screenshots.push(step.screenshot);
                    }
                });
            }
            
            return screenshots;
        },

        // Initialize MCP integration
        init: async function(config) {
            if (config) {
                Object.assign(this.config, config);
            }
            
            // Check if MCP is available
            const available = await this.isAvailable();
            
            if (available) {
                console.log('AgenticQA MCP integration initialized successfully');
            } else {
                console.log('MCP server not available. Tests will run in manual mode.');
            }
            
            return available;
        }
    };

    // Auto-initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        window.AgenticQAMCP.init();
    });

})(); 