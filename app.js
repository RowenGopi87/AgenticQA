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
    showNotification('Executing test...', 'info');
    
    // Simulate API call to Cursor IDE
    // In real implementation, this would be an actual API call
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
    
    // Simulate test execution (replace with actual Cursor API call)
    setTimeout(() => {
        // Random test result for demo
        const statuses = ['passed', 'failed', 'blocked'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        execution.status = randomStatus;
        execution.duration = Math.floor(Math.random() * 10000) + 1000; // Random duration between 1-11 seconds
        
        // Update test status
        test.status = randomStatus;
        test.lastExecuted = execution.executedAt;
        
        saveTestsToStorage();
        saveExecutionsToStorage();
        
        showNotification(`Test ${randomStatus}!`, randomStatus === 'passed' ? 'success' : 'error');
        
        if (randomStatus === 'failed' || randomStatus === 'blocked') {
            // Prompt to log a bug
            if (confirm('Test failed. Would you like to log a bug?')) {
                logBugForTest(testId, execution.id);
            }
        }
        
        // Refresh the page
        loadExecutableTests();
    }, 2000);
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