# AgenticQA - Lightweight Test Management MVP

A modern, lightweight test management system that leverages browser local storage for all data persistence and integrates with Cursor IDE's Playwright MCP for test execution.

## 🚀 Features

### Core Functionality
- **Test Pack Management** - Create, categorize, and manage test prompts
- **Manual MCP Integration** - Execute tests through Cursor IDE with Playwright MCP
- **Local Storage** - No backend required, all data stored in browser
- **Visual Reports** - Charts and analytics for test execution results
- **Bug Tracking** - Link bugs to failed test executions
- **Data Import/Export** - Backup and restore your test data

### Test Categories
- Functional
- Regression  
- System Integration
- Smoke Test
- Performance

## 🎯 Using with Cursor IDE & Playwright MCP

AgenticQA integrates seamlessly with Cursor IDE's Playwright MCP for automated test execution:

### 🚀 Automatic Integration (No Manual Copying!)

**Option 1: Browser Extension (Recommended)**
1. Install the AgenticQA Browser Extension (see `docs/browser-extension-setup.md`)
2. Extension automatically copies prompts to clipboard and shows notifications
3. Just paste in Cursor Chat (Ctrl+I) - no manual copying needed!

**Option 2: Direct API Integration**
- If Cursor exposes a local API, AgenticQA can send prompts directly
- Fully automated execution without any manual steps
- Currently experimental - falls back to clipboard method

### 📋 Manual Integration (Fallback)
1. **Install Playwright MCP**: `npm install -g @playwright/mcp@latest`
2. **Configure Cursor**: Add Playwright MCP in Cursor Settings → Features → MCP Servers
3. **Execute Tests**: Copy prompts from AgenticQA and run them in Cursor Chat

### 🔄 Workflow
1. Create tests in AgenticQA with natural language instructions
2. Click "Execute" - AgenticQA will:
   - 🟢 **Auto-copy to clipboard** (with browser extension)
   - 🟡 **Show formatted prompt** (manual mode)
3. In Cursor IDE: Open chat (Ctrl+I) and paste
4. Cursor uses Playwright MCP tools to execute automatically
5. Copy JSON results back to AgenticQA for storage and reporting

### 📊 Status Indicators
- 🟢 **Cursor Bridge Ready**: Browser extension active
- 🟡 **MCP Available**: Direct MCP integration available  
- ⚪ **Manual Mode**: Copy/paste required

### 🎯 Example Test Execution
```
Test: Login Functionality
Instructions: 
1. Navigate to https://demo.opencart.com/admin/
2. Enter "demo" in username field
3. Enter "demo" in password field  
4. Click Login button
5. Verify dashboard loads

Result: 
- Extension copies prompt to clipboard automatically
- Cursor executes using browser_navigate, browser_type, browser_click tools
- Results returned as JSON for AgenticQA storage
```

**Setup Guides:**
- Browser Extension: `docs/browser-extension-setup.md`
- Cursor MCP Config: `docs/cursor-quickstart.md`
- Manual Setup: `docs/playwright-mcp-setup.md`

## 🔧 How It Works

### 1. Open AgenticQA
Simply open `index.html` in your web browser. No installation or server setup required!

### 2. Create Test Packs
Navigate to "Test Packs" and create your test prompts with:
- Test name
- Test type/category
- Feature/module
- Test instructions (natural language prompt)
- Expected results

### 3. Execute Tests via Cursor IDE
When you click "Execute" on a test:
1. AgenticQA generates a formatted test prompt
2. Copy the prompt to your clipboard
3. Paste it into Cursor IDE with Playwright MCP enabled
4. Execute the test in Cursor
5. Copy the results back to AgenticQA
6. The app will parse and store the results automatically

### 4. View Reports
The Reports section provides:
- Test execution statistics
- Pass/fail rate trends
- Execution history with filtering
- Detailed execution results with screenshots (if provided by MCP)

### 5. Track Bugs
- Log bugs for failed tests
- Track bug severity and status
- Link bugs to specific test executions

## 📋 Test Execution Format

### Input Prompt to Cursor IDE
The app generates prompts in this format:
```
Execute the following test using Playwright:

Test Name: [Test Name]
Module: [Module Name]
Type: [Test Type]

Test Steps:
[Your test steps in natural language]

Expected Results:
[Expected outcomes]

Please execute this test and return the results in JSON format including:
- Overall status (passed/failed/blocked)
- Execution duration
- Step-by-step results with screenshots if applicable
- Any error logs or messages
- Validation of expected results
```

### Expected Response Format
The app can parse JSON responses like:
```json
{
  "status": "passed",
  "duration": 5200,
  "steps": [
    {
      "action": "Navigate to homepage",
      "status": "passed",
      "duration": 1200,
      "screenshot": "data:image/png;base64,..."
    }
  ],
  "logs": ["Test started", "All assertions passed"],
  "validationResults": {
    "passed": true,
    "details": "All expected results matched"
  }
}
```

Or simple text responses like:
- "Test passed"
- "Test failed: Element not found"
- "Test blocked: Environment issue"

## 🛠 Installation & Usage

1. Clone the repository:
   ```bash
   git clone https://github.com/RowenGopi87/AgenticQA.git
   cd AgenticQA
   ```

2. Open `index.html` in a web browser

3. Start creating and executing tests!

## 💾 Data Management

### Local Storage
All data is stored in browser localStorage under these keys:
- `agenticqa_tests` - Test definitions
- `agenticqa_executions` - Execution history
- `agenticqa_bugs` - Bug reports

### Export/Import
- Click "Export" to download all your data as JSON
- Click "Import" to restore data from a previous export

## 🎨 Technology Stack
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Icons**: Feather Icons
- **Charts**: Chart.js
- **Storage**: Browser LocalStorage

## 📝 Key Features

### Test Management
- Create, edit, and delete test cases
- Categorize by type and module
- Natural language test prompts
- Expected results documentation

### Execution Tracking
- Manual execution through Cursor IDE
- Status tracking (passed/failed/blocked/in progress)
- Execution duration recording
- Screenshot support (base64 encoded)
- Step-by-step results

### Reporting & Analytics
- Test execution trends over time
- Pass/fail distribution charts
- Filterable execution history
- Detailed execution reports

### Bug Management
- Log bugs with title, description, and severity
- Link bugs to failed test executions
- Track bug status (open/closed)
- View associated test information

## 🚀 Future Enhancements
- Direct API integration with Cursor IDE when available
- Automated test scheduling
- Team collaboration features
- Test suite management
- Performance benchmarking

## 🤝 Contributing
Feel free to submit issues and enhancement requests!

## 📄 License
This project is open source and available under the MIT License. 