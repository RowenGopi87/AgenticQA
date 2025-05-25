// Initialize Feather Icons
document.addEventListener('DOMContentLoaded', function() {
    feather.replace();
    initializeApp();
});

// Global state
let currentPage = 'testPacks';
let tests = [];
let testExecutions = [];
let bugs = [];

// Global WebSocket connection
let ws = null;
let bridgeServerAvailable = false;

// Initialize the application
function initializeApp() {
    loadDataFromStorage();
    showPage('testPacks');
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setupEventListeners();
    
    // Initialize WebSocket and check bridge server status
    initializeWebSocket(); // Attempt to connect immediately
    checkBridgeServer(); // Initial check
    setInterval(checkBridgeServer, 5000); // Periodically check bridge server status every 5 seconds
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('addTestForm').addEventListener('submit', handleAddTest);
    document.getElementById('editTestForm').addEventListener('submit', handleEditTest);
}

// Update current date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    document.getElementById('currentDateTime').textContent = now.toLocaleDateString('en-US', options);
}

// Navigation functionality
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-indigo-600', 'border-indigo-600');
        btn.classList.add('text-gray-700', 'border-transparent');
    });
    
    // Show selected page
    document.getElementById(pageName + 'Page').classList.remove('hidden');
    
    // Add active class to selected nav button
    const activeNav = document.getElementById('nav' + pageName.charAt(0).toUpperCase() + pageName.slice(1));
    activeNav.classList.add('text-indigo-600', 'border-indigo-600');
    activeNav.classList.remove('text-gray-700', 'border-transparent');
    
    currentPage = pageName;
    
    // Load page-specific content
    switch(pageName) {
        case 'testPacks':
            loadTestPacks();
            break;
        case 'execute':
            loadExecutableTests();
            break;
        case 'reports':
            loadReports();
            break;
        case 'bugs':
            loadBugs();
            break;
    }
}

// LocalStorage operations
function loadDataFromStorage() {
    const storedTests = localStorage.getItem('agenticqa_tests');
    const storedExecutions = localStorage.getItem('agenticqa_executions');
    const storedBugs = localStorage.getItem('agenticqa_bugs');
    
    tests = storedTests ? JSON.parse(storedTests) : [];
    testExecutions = storedExecutions ? JSON.parse(storedExecutions) : [];
    bugs = storedBugs ? JSON.parse(storedBugs) : [];
}

function saveTestsToStorage() {
    localStorage.setItem('agenticqa_tests', JSON.stringify(tests));
}

function saveExecutionsToStorage() {
    localStorage.setItem('agenticqa_executions', JSON.stringify(testExecutions));
}

function saveBugsToStorage() {
    localStorage.setItem('agenticqa_bugs', JSON.stringify(bugs));
}

// Test Pack Management
function showAddTestModal() {
    document.getElementById('addTestModal').classList.remove('hidden');
}

function closeAddTestModal() {
    document.getElementById('addTestModal').classList.add('hidden');
    document.getElementById('addTestForm').reset();
}

function handleAddTest(event) {
    event.preventDefault();
    
    const test = {
        id: generateId(),
        name: document.getElementById('testName').value,
        type: document.getElementById('testType').value,
        module: document.getElementById('testModule').value,
        prompt: document.getElementById('testPrompt').value,
        expectedResults: document.getElementById('expectedResults').value,
        createdAt: new Date().toISOString(),
        lastExecuted: null,
        status: 'not_executed'
    };
    
    tests.push(test);
    saveTestsToStorage();
    closeAddTestModal();
    loadTestPacks();
    
    showNotification('Test added successfully!', 'success');
}

function showEditTestModal(testId) {
    const test = tests.find(t => t.id === testId);
    if (!test) return;
    
    document.getElementById('editTestId').value = test.id;
    document.getElementById('editTestName').value = test.name;
    document.getElementById('editTestType').value = test.type;
    document.getElementById('editTestModule').value = test.module;
    document.getElementById('editTestPrompt').value = test.prompt;
    document.getElementById('editExpectedResults').value = test.expectedResults;
    
    document.getElementById('editTestModal').classList.remove('hidden');
}

function closeEditTestModal() {
    document.getElementById('editTestModal').classList.add('hidden');
    document.getElementById('editTestForm').reset();
}

function handleEditTest(event) {
    event.preventDefault();
    
    const testId = document.getElementById('editTestId').value;
    const test = tests.find(t => t.id === testId);
    
    if (test) {
        test.name = document.getElementById('editTestName').value;
        test.type = document.getElementById('editTestType').value;
        test.module = document.getElementById('editTestModule').value;
        test.prompt = document.getElementById('editTestPrompt').value;
        test.expectedResults = document.getElementById('editExpectedResults').value;
        
        saveTestsToStorage();
        closeEditTestModal();
        loadTestPacks();
        
        showNotification('Test updated successfully!', 'success');
    }
}

function loadTestPacks() {
    const container = document.getElementById('testPacksList');
    container.innerHTML = '';
    
    if (tests.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i data-feather="inbox" class="w-16 h-16 mx-auto text-gray-300 mb-4"></i>
                <p class="text-gray-500">No tests created yet. Click "Add New Test" to get started.</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    tests.forEach(test => {
        const testCard = createTestCard(test);
        container.appendChild(testCard);
    });
    
    feather.replace();
}

function createTestCard(test) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow';
    
    const statusColor = getStatusColor(test.status);
    const typeIcon = getTestTypeIcon(test.type);
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div class="flex items-start space-x-3">
                <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <i data-feather="${typeIcon}" class="w-5 h-5 text-gray-600"></i>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-800">${escapeHtml(test.name)}</h3>
                    <p class="text-sm text-gray-500">${escapeHtml(test.module)} • ${formatTestType(test.type)}</p>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColor}">
                    ${formatStatus(test.status)}
                </span>
                <button onclick="showEditTestModal('${test.id}')" class="p-2 hover:bg-gray-100 rounded-lg">
                    <i data-feather="edit-2" class="w-4 h-4 text-gray-600"></i>
                </button>
                <button onclick="deleteTest('${test.id}')" class="p-2 hover:bg-gray-100 rounded-lg">
                    <i data-feather="trash-2" class="w-4 h-4 text-red-600"></i>
                </button>
            </div>
        </div>
        <div class="space-y-2">
            <div>
                <p class="text-sm font-medium text-gray-700">Prompt:</p>
                <p class="text-sm text-gray-600 line-clamp-2">${escapeHtml(test.prompt)}</p>
            </div>
            <div>
                <p class="text-sm font-medium text-gray-700">Expected Results:</p>
                <p class="text-sm text-gray-600 line-clamp-2">${escapeHtml(test.expectedResults)}</p>
            </div>
        </div>
        <div class="mt-4 flex justify-between items-center">
            <p class="text-xs text-gray-500">Created ${formatDate(test.createdAt)}</p>
            ${test.lastExecuted ? `<p class="text-xs text-gray-500">Last run ${formatDate(test.lastExecuted)}</p>` : ''}
        </div>
    `;
    
    return card;
}

// Execute Tests Page
function loadExecutableTests() {
    const container = document.getElementById('executeTestsList');
    container.innerHTML = '';
    
    if (tests.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i data-feather="play-circle" class="w-16 h-16 mx-auto text-gray-300 mb-4"></i>
                <p class="text-gray-500">No tests available for execution. Create tests first.</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    tests.forEach(test => {
        const execCard = createExecutableTestCard(test);
        container.appendChild(execCard);
    });
    
    feather.replace();
}

function createExecutableTestCard(test) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-sm p-6';
    
    const lastExecution = getLastExecution(test.id);
    const isRunning = testExecutions.some(e => e.testId === test.id && e.status === 'in_progress');
    
    card.innerHTML = `
        <div class="flex justify-between items-center">
            <div class="flex-1">
                <h3 class="font-semibold text-gray-800 mb-1">${escapeHtml(test.name)}</h3>
                <p class="text-sm text-gray-500">${escapeHtml(test.module)} • ${formatTestType(test.type)}</p>
                ${lastExecution ? `
                    <div class="mt-2">
                        <span class="text-xs text-gray-500">Last run: ${formatDate(lastExecution.executedAt)}</span>
                        <span class="ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(lastExecution.status)}">
                            ${formatStatus(lastExecution.status)}
                        </span>
                    </div>
                ` : ''}
            </div>
            <button 
                onclick="executeTest('${test.id}')" 
                ${isRunning ? 'disabled' : ''}
                class="ml-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}">
                <div class="flex items-center space-x-2">
                    ${isRunning ? `
                        <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Running...</span>
                    ` : `
                        <i data-feather="play" class="w-4 h-4"></i>
                        <span>Execute</span>
                    `}
                </div>
            </button>
        </div>
    `;
    
    return card;
}

// Check if bridge server is running
async function checkBridgeServer() {
    try {
        const response = await fetch('http://localhost:3001/api/status');
        const data = await response.json();
        bridgeServerAvailable = data.status === 'running';
        updateBridgeStatusIndicator(true);
        return bridgeServerAvailable;
    } catch (error) {
        bridgeServerAvailable = false;
        updateBridgeStatusIndicator(false);
        return false;
    }
}

// Update bridge status indicator in UI
function updateBridgeStatusIndicator(connected) {
    const statusDot = document.getElementById('bridgeStatusDot');
    const statusText = document.getElementById('bridgeStatusText');
    
    if (connected) {
        statusDot.classList.remove('bg-gray-400', 'bg-red-500');
        statusDot.classList.add('bg-green-500');
        statusText.textContent = 'Bridge Connected';
        statusText.classList.remove('text-gray-500', 'text-red-600');
        statusText.classList.add('text-green-600');
        bridgeServerAvailable = true;
    } else {
        statusDot.classList.remove('bg-green-500');
        statusDot.classList.add('bg-red-500');
        statusText.textContent = 'Bridge Disconnected';
        statusText.classList.remove('text-green-600');
        statusText.classList.add('text-red-600');
        bridgeServerAvailable = false;
    }
}

// Initialize WebSocket connection
function initializeWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) return;
    
    ws = new WebSocket('ws://localhost:3002');
    
    ws.onopen = () => {
        console.log('WebSocket connected to MCP Bridge');
        // No need to update indicator here, checkBridgeServer handles it
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Bridge status will be updated by checkBridgeServer
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected');
        ws = null;
        bridgeServerAvailable = false; // Explicitly set to false
        updateBridgeStatusIndicator(false);
        // Try to reconnect only if bridge server is deemed available by http check
        // This prevents constant reconnection attempts if server is genuinely down.
    };
}

// Handle WebSocket messages
function handleWebSocketMessage(data) {
    console.log('Received WebSocket message:', data);
    switch (data.type) {
        case 'bridge_status':
            updateBridgeStatusIndicator(data.mcpReady);
            break;
        case 'test_started':
            showNotification('Test execution started via MCP Bridge...', 'info');
            break;
        case 'test_completed':
            handleTestCompletion(data);
            break;
        case 'test_error':
            showNotification(`Test Error: ${data.error}`, 'error');
            // Re-enable button on error if a specific testId is part of data
            if(data.testId) {
                updateExecuteButton(data.testId, false);
            }
            break;
        default:
            console.log('Unknown WebSocket message type:', data.type);
    }
}

// Handle automated test completion
function handleTestCompletion(data) {
    // Find the test and execution
    const test = tests.find(t => t.id === data.testId);
    const execution = testExecutions.find(e => e.testId === data.testId && e.status === 'in_progress');
    
    if (!test || !execution) return;
    
    // Update execution
    execution.status = data.status;
    execution.duration = data.duration;
    execution.logs = data.logs;
    execution.screenshots = data.screenshots;
    execution.validationResults = data.validationResults;
    
    // Update test status
    test.status = data.status;
    test.lastExecuted = data.executedAt;
    
    saveTestsToStorage();
    saveExecutionsToStorage();
    
    showNotification(`Test ${data.status}! ${data.validationResults?.details || ''}`, 
        data.status === 'passed' ? 'success' : 'error');
    
    if (data.status === 'failed' || data.status === 'blocked') {
        // Prompt to log a bug
        if (confirm('Test failed. Would you like to log a bug?')) {
            logBugForTest(data.testId, execution.id);
        }
    }
    
    // Refresh the current page
    switch(currentPage) {
        case 'execute':
            loadExecutableTests();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

async function executeTest(testId) {
    const test = tests.find(t => t.id === testId);
    if (!test) return;
    
    // Create execution record
    const execution = {
        id: generateId(),
        testId: testId,
        status: 'in_progress',
        executedAt: new Date().toISOString(),
        duration: null,
        screenshots: [],
        logs: [],
        steps: []
    };
    
    testExecutions.push(execution);
    saveExecutionsToStorage();
    
    // Update UI to show test is running
    loadExecutableTests();
    
    // Show execution modal with instructions
    showExecutionModal(test, execution);
}

function showExecutionModal(test, execution) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    modal.id = `execution-modal-${execution.id}`;
    
    const content = `
        <div class="bg-white rounded-xl shadow-xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">Execute Test: ${escapeHtml(test.name)}</h3>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 class="font-semibold text-blue-800 mb-2">Instructions for Cursor IDE:</h4>
                <ol class="list-decimal list-inside space-y-2 text-sm text-blue-700">
                    <li>Copy the test prompt below</li>
                    <li>Open Cursor IDE with Playwright MCP enabled</li>
                    <li>Paste the prompt and execute it</li>
                    <li>Once execution completes, paste the results back here</li>
                </ol>
            </div>
            
            <div class="mb-6">
                <h4 class="font-semibold text-gray-800 mb-2">Test Prompt:</h4>
                <div class="bg-gray-100 rounded-lg p-4">
                    <pre class="whitespace-pre-wrap text-sm text-gray-700">${generateMCPPrompt(test)}</pre>
                </div>
                <button onclick="copyToClipboard('${escapeQuotes(generateMCPPrompt(test))}')" class="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
                    <i data-feather="copy" class="w-4 h-4 inline"></i> Copy Prompt
                </button>
            </div>
            
            <div class="mb-6">
                <h4 class="font-semibold text-gray-800 mb-2">Paste Execution Results:</h4>
                <textarea 
                    id="execution-results-${execution.id}" 
                    rows="10" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Paste the JSON results from Cursor IDE here..."
                ></textarea>
            </div>
            
            <div class="flex justify-end space-x-4">
                <button onclick="cancelExecution('${execution.id}')" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
                <button onclick="saveExecutionResults('${test.id}', '${execution.id}')" class="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg">
                    Save Results
                </button>
            </div>
        </div>
    `;
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
    feather.replace();
}

function generateMCPPrompt(test) {
    return `Execute the following test using Playwright:

Test Name: ${test.name}
Module: ${test.module}
Type: ${test.type}

Test Steps:
${test.prompt}

Expected Results:
${test.expectedResults}

Please execute this test and return the results in JSON format including:
- Overall status (passed/failed/blocked)
- Execution duration
- Step-by-step results with screenshots if applicable
- Any error logs or messages
- Validation of expected results`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy to clipboard', 'error');
    });
}

function cancelExecution(executionId) {
    const execution = testExecutions.find(e => e.id === executionId);
    if (execution) {
        execution.status = 'cancelled';
        saveExecutionsToStorage();
    }
    
    const modal = document.getElementById(`execution-modal-${executionId}`);
    if (modal) {
        modal.remove();
    }
    
    loadExecutableTests();
}

function saveExecutionResults(testId, executionId) {
    const resultsTextarea = document.getElementById(`execution-results-${executionId}`);
    const resultsText = resultsTextarea.value.trim();
    
    if (!resultsText) {
        showNotification('Please paste the execution results', 'error');
        return;
    }
    
    try {
        // Try to parse as JSON
        const results = JSON.parse(resultsText);
        
        // Update execution record
        const execution = testExecutions.find(e => e.id === executionId);
        const test = tests.find(t => t.id === testId);
        
        if (execution && test) {
            execution.status = results.status || 'completed';
            execution.duration = results.duration || 0;
            execution.screenshots = results.screenshots || [];
            execution.logs = results.logs || [];
            execution.steps = results.steps || [];
            execution.validationResults = results.validationResults || null;
            
            // Update test status
            test.status = execution.status;
            test.lastExecuted = execution.executedAt;
            
            saveTestsToStorage();
            saveExecutionsToStorage();
            
            // Close modal
            const modal = document.getElementById(`execution-modal-${executionId}`);
            if (modal) {
                modal.remove();
            }
            
            showNotification(`Test ${execution.status}!`, execution.status === 'passed' ? 'success' : 'error');
            
            // Prompt for bug if failed
            if (execution.status === 'failed' || execution.status === 'blocked') {
                if (confirm('Test failed. Would you like to log a bug?')) {
                    showBugModal(testId, executionId);
                }
            }
            
            // Refresh UI
            loadExecutableTests();
        }
    } catch (error) {
        // If not JSON, treat as plain text status
        const execution = testExecutions.find(e => e.id === executionId);
        const test = tests.find(t => t.id === testId);
        
        if (execution && test) {
            // Simple status parsing
            const lowerResults = resultsText.toLowerCase();
            if (lowerResults.includes('passed') || lowerResults.includes('success')) {
                execution.status = 'passed';
            } else if (lowerResults.includes('failed') || lowerResults.includes('error')) {
                execution.status = 'failed';
            } else if (lowerResults.includes('blocked')) {
                execution.status = 'blocked';
            } else {
                execution.status = 'completed';
            }
            
            execution.logs = [resultsText];
            test.status = execution.status;
            test.lastExecuted = execution.executedAt;
            
            saveTestsToStorage();
            saveExecutionsToStorage();
            
            // Close modal
            const modal = document.getElementById(`execution-modal-${executionId}`);
            if (modal) {
                modal.remove();
            }
            
            showNotification(`Test ${execution.status}!`, execution.status === 'passed' ? 'success' : 'error');
            
            // Refresh UI
            loadExecutableTests();
        }
    }
}

// Reports Page
function loadReports() {
    updateReportStats();
    loadTestResultsChart();
    loadExecutionTrendsChart();
    loadExecutionHistory();
}

function updateReportStats() {
    const totalTests = tests.length;
    const totalExecutions = testExecutions.length;
    const passedTests = testExecutions.filter(e => e.status === 'passed').length;
    const passRate = totalExecutions > 0 ? Math.round((passedTests / totalExecutions) * 100) : 0;
    const activeBugs = bugs.filter(b => b.status === 'open').length;
    
    document.getElementById('totalTestsCount').textContent = totalTests;
    document.getElementById('totalExecutionsCount').textContent = totalExecutions;
    document.getElementById('passRatePercentage').textContent = passRate + '%';
    document.getElementById('activeBugsCount').textContent = activeBugs;
}

function loadTestResultsChart() {
    const canvas = document.getElementById('testResultsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if any
    if (window.testResultsChart) {
        window.testResultsChart.destroy();
    }
    
    const statusCounts = {
        passed: testExecutions.filter(e => e.status === 'passed').length,
        failed: testExecutions.filter(e => e.status === 'failed').length,
        blocked: testExecutions.filter(e => e.status === 'blocked').length,
        in_progress: testExecutions.filter(e => e.status === 'in_progress').length
    };
    
    window.testResultsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Passed', 'Failed', 'Blocked', 'In Progress'],
            datasets: [{
                data: [statusCounts.passed, statusCounts.failed, statusCounts.blocked, statusCounts.in_progress],
                backgroundColor: [
                    '#10b981',
                    '#ef4444',
                    '#f59e0b',
                    '#6b7280'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    padding: 20
                }
            }
        }
    });
}

function loadExecutionTrendsChart() {
    const canvas = document.getElementById('executionTrendsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if any
    if (window.executionTrendsChart) {
        window.executionTrendsChart.destroy();
    }
    
    // Group executions by date
    const executionsByDate = {};
    testExecutions.forEach(execution => {
        const date = new Date(execution.executedAt).toLocaleDateString();
        if (!executionsByDate[date]) {
            executionsByDate[date] = { passed: 0, failed: 0, total: 0 };
        }
        executionsByDate[date].total++;
        if (execution.status === 'passed') {
            executionsByDate[date].passed++;
        } else if (execution.status === 'failed') {
            executionsByDate[date].failed++;
        }
    });
    
    const dates = Object.keys(executionsByDate).sort();
    const passedData = dates.map(date => executionsByDate[date].passed);
    const failedData = dates.map(date => executionsByDate[date].failed);
    
    window.executionTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Passed',
                    data: passedData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Failed',
                    data: failedData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function loadExecutionHistory() {
    const tbody = document.getElementById('executionHistoryTable');
    tbody.innerHTML = '';
    
    // Get filtered executions
    const filteredExecutions = getFilteredExecutions();
    
    if (filteredExecutions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    No execution history found
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date descending
    filteredExecutions.sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt));
    
    filteredExecutions.forEach(execution => {
        const test = tests.find(t => t.id === execution.testId);
        if (!test) return;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${escapeHtml(test.name)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${escapeHtml(test.module)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatTestType(test.type)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(execution.status)}">
                    ${formatStatus(execution.status)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${execution.duration ? formatDuration(execution.duration) : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(execution.executedAt)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="showExecutionDetails('${execution.id}')" class="text-indigo-600 hover:text-indigo-900">
                    View Details
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getFilteredExecutions() {
    let filtered = [...testExecutions];
    
    // Filter by test type
    const typeFilter = document.getElementById('filterTestType')?.value;
    if (typeFilter) {
        const testIds = tests.filter(t => t.type === typeFilter).map(t => t.id);
        filtered = filtered.filter(e => testIds.includes(e.testId));
    }
    
    // Filter by status
    const statusFilter = document.getElementById('filterStatus')?.value;
    if (statusFilter) {
        filtered = filtered.filter(e => e.status === statusFilter);
    }
    
    // Filter by date
    const dateFilter = document.getElementById('filterDateFrom')?.value;
    if (dateFilter) {
        const filterDate = new Date(dateFilter);
        filtered = filtered.filter(e => new Date(e.executedAt) >= filterDate);
    }
    
    return filtered;
}

function applyFilters() {
    loadExecutionHistory();
}

function showExecutionDetails(executionId) {
    const execution = testExecutions.find(e => e.id === executionId);
    const test = tests.find(t => t.id === execution?.testId);
    
    if (!execution || !test) return;
    
    const modal = document.getElementById('executionDetailsModal');
    const content = document.getElementById('executionDetailsContent');
    
    content.innerHTML = `
        <div class="space-y-6">
            <div>
                <h4 class="text-lg font-semibold text-gray-800 mb-2">Test Information</h4>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span class="font-medium">Name:</span> ${escapeHtml(test.name)}</p>
                    <p><span class="font-medium">Module:</span> ${escapeHtml(test.module)}</p>
                    <p><span class="font-medium">Type:</span> ${formatTestType(test.type)}</p>
                    <p><span class="font-medium">Status:</span> <span class="${getStatusColor(execution.status)} px-2 py-1 rounded text-xs">${formatStatus(execution.status)}</span></p>
                    <p><span class="font-medium">Duration:</span> ${execution.duration ? formatDuration(execution.duration) : 'N/A'}</p>
                    <p><span class="font-medium">Executed:</span> ${formatDate(execution.executedAt)}</p>
                </div>
            </div>
            
            ${execution.steps && execution.steps.length > 0 ? `
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-2">Execution Steps</h4>
                    <div class="space-y-2">
                        ${execution.steps.map((step, index) => `
                            <div class="bg-gray-50 rounded-lg p-4">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-medium">Step ${index + 1}: ${escapeHtml(step.action || step.description || '')}</p>
                                        <p class="text-sm text-gray-600">Status: ${step.status || 'N/A'}</p>
                                        ${step.duration ? `<p class="text-sm text-gray-600">Duration: ${formatDuration(step.duration)}</p>` : ''}
                                    </div>
                                    ${step.screenshot ? `
                                        <button onclick="showScreenshot('${step.screenshot}')" class="text-indigo-600 hover:text-indigo-800">
                                            <i data-feather="image" class="w-5 h-5"></i>
                                        </button>
                                    ` : ''}
                                </div>
                                ${step.logs && step.logs.length > 0 ? `
                                    <div class="mt-2">
                                        <p class="text-sm font-medium text-gray-700">Logs:</p>
                                        <pre class="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">${escapeHtml(step.logs.join('\n'))}</pre>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${execution.logs && execution.logs.length > 0 ? `
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-2">Execution Logs</h4>
                    <pre class="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto">${escapeHtml(execution.logs.join('\n'))}</pre>
                </div>
            ` : ''}
            
            ${execution.screenshots && execution.screenshots.length > 0 ? `
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-2">Screenshots</h4>
                    <div class="grid grid-cols-3 gap-4">
                        ${execution.screenshots.map((screenshot, index) => `
                            <div class="relative group cursor-pointer" onclick="showScreenshot('${screenshot}')">
                                <img src="${screenshot}" alt="Screenshot ${index + 1}" class="w-full h-32 object-cover rounded-lg screenshot-thumbnail">
                                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                                    <i data-feather="maximize-2" class="w-6 h-6 text-white opacity-0 group-hover:opacity-100"></i>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.classList.remove('hidden');
    feather.replace();
}

function closeExecutionDetailsModal() {
    document.getElementById('executionDetailsModal').classList.add('hidden');
}

function showScreenshot(screenshotUrl) {
    const modal = document.getElementById('screenshotModal');
    const img = document.getElementById('screenshotImage');
    img.src = screenshotUrl;
    modal.classList.remove('hidden');
}

function closeScreenshotModal() {
    document.getElementById('screenshotModal').classList.add('hidden');
}

// Bug Management
function showBugModal(testId, executionId) {
    const test = tests.find(t => t.id === testId);
    if (!test) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    modal.id = 'bug-modal';
    
    const content = `
        <div class="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full mx-4">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">Log Bug</h3>
            
            <form onsubmit="saveBug(event, '${testId}', '${executionId}')" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Bug Title</label>
                    <input type="text" id="bugTitle" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea id="bugDescription" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required></textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select id="bugSeverity" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600">
                        <span class="font-medium">Test:</span> ${escapeHtml(test.name)}<br>
                        <span class="font-medium">Module:</span> ${escapeHtml(test.module)}
                    </p>
                </div>
                
                <div class="flex justify-end space-x-4 pt-4">
                    <button type="button" onclick="closeBugModal()" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" class="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg">
                        Log Bug
                    </button>
                </div>
            </form>
        </div>
    `;
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
}

function closeBugModal() {
    const modal = document.getElementById('bug-modal');
    if (modal) {
        modal.remove();
    }
}

function saveBug(event, testId, executionId) {
    event.preventDefault();
    
    const test = tests.find(t => t.id === testId);
    if (!test) return;
    
    const bug = {
        id: generateId(),
        testId: testId,
        executionId: executionId,
        title: document.getElementById('bugTitle').value,
        description: document.getElementById('bugDescription').value,
        severity: document.getElementById('bugSeverity').value,
        status: 'open',
        createdAt: new Date().toISOString(),
        testName: test.name,
        module: test.module
    };
    
    bugs.push(bug);
    saveBugsToStorage();
    
    closeBugModal();
    showNotification('Bug logged successfully!', 'success');
    
    if (currentPage === 'bugs') {
        loadBugs();
    }
}

function loadBugs() {
    const container = document.getElementById('bugsList');
    container.innerHTML = '';
    
    if (bugs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i data-feather="check-circle" class="w-16 h-16 mx-auto text-gray-300 mb-4"></i>
                <p class="text-gray-500">No bugs logged. Great job!</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    bugs.forEach(bug => {
        const bugCard = createBugCard(bug);
        container.appendChild(bugCard);
    });
    
    feather.replace();
}

function createBugCard(bug) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-sm p-6';
    
    const statusColor = bug.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
    const severityColor = {
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800'
    }[bug.severity] || 'bg-gray-100 text-gray-800';
    
    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                    <i data-feather="alert-triangle" class="w-5 h-5 text-red-500"></i>
                    <h3 class="font-semibold text-gray-800">${escapeHtml(bug.title || `Bug #${bug.id.slice(0, 8)}`)}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColor}">
                        ${bug.status}
                    </span>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${severityColor}">
                        ${bug.severity || 'medium'}
                    </span>
                </div>
                <p class="text-gray-600 mb-2">${escapeHtml(bug.description)}</p>
                <div class="text-sm text-gray-500">
                    <p>Test: ${escapeHtml(bug.testName)}</p>
                    <p>Module: ${escapeHtml(bug.module)}</p>
                    <p>Created: ${formatDate(bug.createdAt)}</p>
                </div>
            </div>
            <div class="flex space-x-2">
                <button onclick="toggleBugStatus('${bug.id}')" class="p-2 hover:bg-gray-100 rounded-lg">
                    <i data-feather="${bug.status === 'open' ? 'check' : 'x'}" class="w-4 h-4 text-gray-600"></i>
                </button>
                <button onclick="deleteBug('${bug.id}')" class="p-2 hover:bg-gray-100 rounded-lg">
                    <i data-feather="trash-2" class="w-4 h-4 text-red-600"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function toggleBugStatus(bugId) {
    const bug = bugs.find(b => b.id === bugId);
    if (bug) {
        bug.status = bug.status === 'open' ? 'closed' : 'open';
        saveBugsToStorage();
        loadBugs();
        showNotification(`Bug ${bug.status}!`, 'success');
    }
}

function deleteBug(bugId) {
    if (confirm('Are you sure you want to delete this bug?')) {
        bugs = bugs.filter(b => b.id !== bugId);
        saveBugsToStorage();
        loadBugs();
        showNotification('Bug deleted!', 'success');
    }
}

// Data Import/Export
function exportData() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        tests: tests,
        executions: testExecutions,
        bugs: bugs
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenticqa-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

function importData() {
    document.getElementById('importDataInput').click();
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.tests || !data.executions || !data.bugs) {
                throw new Error('Invalid data format');
            }
            
            if (confirm('This will replace all existing data. Are you sure you want to continue?')) {
                tests = data.tests || [];
                testExecutions = data.executions || [];
                bugs = data.bugs || [];
                
                saveTestsToStorage();
                saveExecutionsToStorage();
                saveBugsToStorage();
                
                // Reload current page
                showPage(currentPage);
                
                showNotification('Data imported successfully!', 'success');
            }
        } catch (error) {
            showNotification('Failed to import data: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        if (diffHours < 1) {
            const diffMinutes = Math.ceil(diffTime / (1000 * 60));
            return `${diffMinutes} minutes ago`;
        }
        return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    } else {
        return `${seconds}s`;
    }
}

function getStatusColor(status) {
    const colors = {
        'passed': 'bg-green-100 text-green-800',
        'failed': 'bg-red-100 text-red-800',
        'blocked': 'bg-yellow-100 text-yellow-800',
        'not_executed': 'bg-gray-100 text-gray-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'cancelled': 'bg-gray-100 text-gray-800',
        'completed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatStatus(status) {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatTestType(type) {
    const types = {
        'functional': 'Functional',
        'regression': 'Regression',
        'integration': 'System Integration',
        'smoke': 'Smoke Test',
        'performance': 'Performance'
    };
    return types[type] || type;
}

function getTestTypeIcon(type) {
    const icons = {
        'functional': 'tool',
        'regression': 'refresh-cw',
        'integration': 'git-merge',
        'smoke': 'wind',
        'performance': 'activity'
    };
    return icons[type] || 'file-text';
}

function getLastExecution(testId) {
    const executions = testExecutions.filter(e => e.testId === testId);
    return executions.length > 0 ? executions[executions.length - 1] : null;
}

function deleteTest(testId) {
    if (confirm('Are you sure you want to delete this test? This will also delete all related executions and bugs.')) {
        tests = tests.filter(t => t.id !== testId);
        testExecutions = testExecutions.filter(e => e.testId !== testId);
        bugs = bugs.filter(b => b.testId !== testId);
        
        saveTestsToStorage();
        saveExecutionsToStorage();
        saveBugsToStorage();
        
        loadTestPacks();
        showNotification('Test deleted!', 'success');
    }
}

function editTest(testId) {
    showEditTestModal(testId);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function escapeQuotes(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 z-50`;
    
    switch(type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'info':
            notification.classList.add('bg-blue-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-gray-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i data-feather="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}" class="w-5 h-5"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    feather.replace();
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('translate-y-0', 'opacity-100');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 