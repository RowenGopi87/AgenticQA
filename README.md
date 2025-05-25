# AgenticQA - Lightweight Test Management MVP

A modern, lightweight test management system that leverages browser local storage for all data persistence and integrates with Playwright MCP for automated test execution.

## 🚀 Features

### Core Functionality
- **Test Pack Management** - Create, categorize, and manage test prompts
- **Automated Test Execution** - Direct integration with Playwright MCP server for automated browser testing
- **Manual Execution Fallback** - Execute tests manually through Cursor IDE when MCP is not available
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

## 🔧 How It Works

### 1. Configure Playwright MCP in Cursor IDE
The Playwright MCP integration works through Cursor IDE, not directly with the web app.

**Setup in Cursor IDE:**
1. Install Playwright MCP in Cursor by going to Settings → MCP → Add Server
2. Configure it with:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

**Note:** The MCP status in AgenticQA will show "MCP Offline" because direct browser-to-MCP connections are not supported. MCP servers communicate through IDE clients like Cursor, not web browsers.

### 2. Open AgenticQA
Simply open `index.html` in your web browser. No additional installation required!

### 3. Create Test Packs
Navigate to "Test Packs" and create your test prompts with:
- Test name
- Test type/category
- Feature/module
- Test instructions (natural language prompt)
- Expected results

### 4. Execute Tests
When you click "Execute" on a test:

**Manual Execution through Cursor IDE:**
1. A modal appears with the test prompt
2. Copy the prompt to your clipboard
3. Paste it into Cursor IDE (with Playwright MCP enabled)
4. Cursor will execute the test using Playwright MCP
5. Copy the results from Cursor
6. Paste them back into AgenticQA
7. Results are parsed and stored automatically

**Why Manual?**
MCP (Model Context Protocol) is designed to work through IDE clients like Cursor, not directly from web browsers. This ensures security and proper integration with AI assistants.

### 5. View Reports
The Reports section provides:
- Test execution statistics
- Pass/fail rate trends
- Execution history with filtering
- Detailed execution results with screenshots

### 6. Track Bugs
- Log bugs for failed tests
- Track bug severity and status
- Link bugs to specific test executions

## 📋 Test Prompt Format

### Writing Test Prompts
Write your test steps in natural language. The system will parse and execute them automatically when MCP is connected.

**Example Test Prompt:**
```
Navigate to https://example.com
Click on "Login" button
Type "user@example.com" in "Email" field
Type "password123" in "Password" field
Click "Submit"
Wait for 2 seconds
Verify "Dashboard" text is visible
```

### Supported Actions:
- **Navigate**: `Navigate to [URL]`, `Go to [URL]`, `Open [URL]`
- **Click**: `Click on "[element]"`, `Click the "[element]" button`
- **Type**: `Type "[text]" in "[field]"`, `Enter "[text]" into "[field]"`
- **Wait**: `Wait for [X] seconds`, `Wait [X]`
- **Verify**: `Verify "[text]" is visible`, `Check that "[element]" exists`

### Automated Execution via Playwright MCP
When MCP is connected, AgenticQA:
1. Parses your natural language test steps
2. Converts them to Playwright MCP commands
3. Executes them in a real browser
4. Captures screenshots
5. Returns detailed results

### Manual Execution Format
When executing manually through Cursor IDE, the app expects results in JSON format:
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
  "logs": ["Test started", "All assertions passed"]
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