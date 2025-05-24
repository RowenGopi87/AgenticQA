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

// Initialize the application
function initializeApp() {
    loadDataFromStorage();
    showPage('testPacks');
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('addTestForm').addEventListener('submit', handleAddTest);
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
                    <h3 class="font-semibold text-gray-800">${test.name}</h3>
                    <p class="text-sm text-gray-500">${test.module} • ${formatTestType(test.type)}</p>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColor}">
                    ${formatStatus(test.status)}
                </span>
                <button onclick="editTest('${test.id}')" class="p-2 hover:bg-gray-100 rounded-lg">
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
                <p class="text-sm text-gray-600 line-clamp-2">${test.prompt}</p>
            </div>
            <div>
                <p class="text-sm font-medium text-gray-700">Expected Results:</p>
                <p class="text-sm text-gray-600 line-clamp-2">${test.expectedResults}</p>
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
    
    card.innerHTML = `
        <div class="flex justify-between items-center">
            <div class="flex-1">
                <h3 class="font-semibold text-gray-800 mb-1">${test.name}</h3>
                <p class="text-sm text-gray-500">${test.module} • ${formatTestType(test.type)}</p>
                ${lastExecution ? `
                    <div class="mt-2">
                        <span class="text-xs text-gray-500">Last run: ${formatDate(lastExecution.executedAt)}</span>
                        <span class="ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(lastExecution.status)}">
                            ${formatStatus(lastExecution.status)}
                        </span>
                    </div>
                ` : ''}
            </div>
            <button onclick="executeTest('${test.id}')" class="ml-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                <div class="flex items-center space-x-2">
                    <i data-feather="play" class="w-4 h-4"></i>
                    <span>Execute</span>
                </div>
            </button>
        </div>
    `;
    
    return card;
}

async function executeTest(testId) {
    const test = tests.find(t => t.id === testId);
    if (!test) return;
    
    // Show executing state
    showNotification('Executing test via Cursor MCP...', 'info');
    
    // Create execution record
    const execution = {
        id: generateId(),
        testId: testId,
        status: 'in_progress',
        executedAt: new Date().toISOString(),
        duration: null,
        screenshot: null,
        logs: null
    };
    
    testExecutions.push(execution);
    saveExecutionsToStorage();
    
    // Update UI to show test is running
    const executeBtn = document.querySelector(`button[onclick="executeTest('${testId}')"]`);
    if (executeBtn) {
        executeBtn.disabled = true;
        executeBtn.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Running...</span>
            </div>
        `;
    }
    
    const startTime = Date.now();
    
    try {
        // Prepare the test prompt for MCP execution
        const mcpPrompt = {
            action: "playwright_test",
            testName: test.name,
            testType: test.type,
            module: test.module,
            prompt: test.prompt,
            expectedResults: test.expectedResults
        };
        
        // Since MCP runs through Cursor IDE, we'll use a different approach
        // We'll create a formatted prompt that Cursor's agent can execute
        const formattedPrompt = `
Execute this Playwright test:

Test Name: ${test.name}
Test Type: ${test.type}
Module: ${test.module}

Test Instructions:
${test.prompt}

Expected Results:
${test.expectedResults}

Please:
1. Navigate to the appropriate page/URL
2. Perform the test actions as described
3. Verify the expected results
4. Return the test status (passed/failed/blocked) and any relevant screenshots or logs
`;

        // Since we can't directly call MCP from the browser, we'll need to use a different approach
        // Option 1: Use Cursor's API if available
        // Option 2: Copy prompt to clipboard and notify user to paste in Cursor
        // Option 3: Use a local server as a bridge
        
        // For now, let's implement Option 2 - Copy to clipboard
        await navigator.clipboard.writeText(formattedPrompt);
        
        // Show modal with instructions
        showMCPInstructionsModal(test, execution, startTime);
        
    } catch (error) {
        console.error('Error executing test:', error);
        
        // Update execution with error
        execution.status = 'failed';
        execution.duration = Date.now() - startTime;
        execution.logs = `Error: ${error.message}`;
        
        // Update test status
        test.status = 'failed';
        test.lastExecuted = execution.executedAt;
        
        saveTestsToStorage();
        saveExecutionsToStorage();
        
        showNotification('Test execution failed!', 'error');
        
        // Re-enable button
        if (executeBtn) {
            executeBtn.disabled = false;
            executeBtn.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i data-feather="play" class="w-4 h-4"></i>
                    <span>Execute</span>
                </div>
            `;
            feather.replace();
        }
        
        loadExecutableTests();
    }
}

function showMCPInstructionsModal(test, execution, startTime) {
    // Create modal for MCP instructions
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    modal.id = 'mcpInstructionsModal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full mx-4">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Execute Test in Cursor</h3>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p class="text-sm text-blue-800 mb-2">
                    <strong>Test prompt has been copied to your clipboard!</strong>
                </p>
                <p class="text-sm text-gray-700">
                    Please follow these steps to execute the test:
                </p>
                <ol class="list-decimal list-inside text-sm text-gray-700 mt-2 space-y-1">
                    <li>Switch to Cursor IDE</li>
                    <li>Open the Playwright MCP interface</li>
                    <li>Paste the test prompt (Ctrl+V / Cmd+V)</li>
                    <li>Execute the test</li>
                    <li>Return here to record the results</li>
                </ol>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Test Status</label>
                    <select id="mcpTestStatus" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        <option value="">Select Status</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Notes/Logs (Optional)</label>
                    <textarea id="mcpTestLogs" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Any additional notes or error messages..."></textarea>
                </div>
            </div>
            
            <div class="flex justify-end space-x-4 mt-6">
                <button onclick="cancelMCPExecution('${test.id}', '${execution.id}')" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
                <button onclick="saveMCPResults('${test.id}', '${execution.id}', ${startTime})" class="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg">
                    Save Results
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function cancelMCPExecution(testId, executionId) {
    // Remove the modal
    const modal = document.getElementById('mcpInstructionsModal');
    if (modal) {
        document.body.removeChild(modal);
    }
    
    // Remove the in-progress execution
    testExecutions = testExecutions.filter(e => e.id !== executionId);
    saveExecutionsToStorage();
    
    // Re-enable the execute button
    loadExecutableTests();
    
    showNotification('Test execution cancelled', 'info');
}

function saveMCPResults(testId, executionId, startTime) {
    const status = document.getElementById('mcpTestStatus').value;
    const logs = document.getElementById('mcpTestLogs').value;
    
    if (!status) {
        showNotification('Please select a test status', 'error');
        return;
    }
    
    // Find the test and execution
    const test = tests.find(t => t.id === testId);
    const execution = testExecutions.find(e => e.id === executionId);
    
    if (!test || !execution) {
        showNotification('Error saving results', 'error');
        return;
    }
    
    // Update execution
    execution.status = status;
    execution.duration = Date.now() - startTime;
    execution.logs = logs || null;
    
    // Update test status
    test.status = status;
    test.lastExecuted = execution.executedAt;
    
    saveTestsToStorage();
    saveExecutionsToStorage();
    
    // Remove modal
    const modal = document.getElementById('mcpInstructionsModal');
    if (modal) {
        document.body.removeChild(modal);
    }
    
    showNotification(`Test ${status}!`, status === 'passed' ? 'success' : 'error');
    
    if (status === 'failed' || status === 'blocked') {
        // Prompt to log a bug
        if (confirm('Test failed. Would you like to log a bug?')) {
            logBugForTest(testId, executionId);
        }
    }
    
    // Refresh the page
    loadExecutableTests();
}

// Reports Page
function loadReports() {
    updateReportStats();
    loadTestResultsChart();
}

function updateReportStats() {
    const totalTests = tests.length;
    const passedTests = testExecutions.filter(e => e.status === 'passed').length;
    const totalExecutions = testExecutions.length;
    const passRate = totalExecutions > 0 ? Math.round((passedTests / totalExecutions) * 100) : 0;
    const activeBugs = bugs.filter(b => b.status === 'open').length;
    
    document.getElementById('totalTestsCount').textContent = totalTests;
    document.getElementById('passRatePercentage').textContent = passRate + '%';
    document.getElementById('activeBugsCount').textContent = activeBugs;
}

function loadTestResultsChart() {
    const canvas = document.getElementById('testResultsChart');
    if (!canvas) return;
    
    // Load Chart.js dynamically
    if (!window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => createResultsChart();
        document.head.appendChild(script);
    } else {
        createResultsChart();
    }
}

function createResultsChart() {
    const ctx = document.getElementById('testResultsChart').getContext('2d');
    
    const statusCounts = {
        passed: testExecutions.filter(e => e.status === 'passed').length,
        failed: testExecutions.filter(e => e.status === 'failed').length,
        blocked: testExecutions.filter(e => e.status === 'blocked').length,
        in_progress: testExecutions.filter(e => e.status === 'in_progress').length
    };
    
    new Chart(ctx, {
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
                },
                title: {
                    display: true,
                    text: 'Test Execution Results',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20
                }
            }
        }
    });
}

// Bug Management
function logBugForTest(testId, executionId) {
    const test = tests.find(t => t.id === testId);
    if (!test) return;
    
    const bugDescription = prompt('Describe the bug:');
    if (!bugDescription) return;
    
    const bug = {
        id: generateId(),
        testId: testId,
        executionId: executionId,
        description: bugDescription,
        status: 'open',
        createdAt: new Date().toISOString(),
        testName: test.name,
        module: test.module
    };
    
    bugs.push(bug);
    saveBugsToStorage();
    
    showNotification('Bug logged successfully!', 'success');
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
    
    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                    <i data-feather="alert-triangle" class="w-5 h-5 text-red-500"></i>
                    <h3 class="font-semibold text-gray-800">Bug #${bug.id.slice(0, 8)}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColor}">
                        ${bug.status}
                    </span>
                </div>
                <p class="text-gray-600 mb-2">${bug.description}</p>
                <div class="text-sm text-gray-500">
                    <p>Test: ${bug.testName}</p>
                    <p>Module: ${bug.module}</p>
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

function getStatusColor(status) {
    const colors = {
        'passed': 'bg-green-100 text-green-800',
        'failed': 'bg-red-100 text-red-800',
        'blocked': 'bg-yellow-100 text-yellow-800',
        'not_executed': 'bg-gray-100 text-gray-800',
        'in_progress': 'bg-blue-100 text-blue-800'
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
    if (confirm('Are you sure you want to delete this test?')) {
        tests = tests.filter(t => t.id !== testId);
        saveTestsToStorage();
        loadTestPacks();
        showNotification('Test deleted!', 'success');
    }
}

function editTest(testId) {
    // For MVP, we'll just show an alert
    alert('Edit functionality will be implemented in the next iteration.');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 z-50`;
    
    // Set color based on type
    switch(type) {
        case 'success':
            notification.className += ' bg-green-500 text-white';
            break;
        case 'error':
            notification.className += ' bg-red-500 text-white';
            break;
        case 'info':
            notification.className += ' bg-blue-500 text-white';
            break;
        default:
            notification.className += ' bg-gray-800 text-white';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add helper function to create a bridge server setup script
function generateMCPBridgeSetup() {
    const setupScript = `
// MCP Bridge Server Setup
// Save this as mcp-bridge-server.js and run with Node.js

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/execute-test', async (req, res) => {
    const { prompt } = req.body;
    
    try {
        // Execute via MCP
        exec(\`npx @playwright/mcp@latest "\${prompt}"\`, (error, stdout, stderr) => {
            if (error) {
                res.json({ status: 'failed', error: error.message });
                return;
            }
            res.json({ status: 'passed', output: stdout });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log('MCP Bridge Server running on http://localhost:3001');
});
`;
    
    return setupScript;
} 