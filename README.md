# AgenticQA - Test Management MVP with MCP Integration

A modern, lightweight test management system that leverages browser local storage and integrates with Cursor's Playwright MCP (Model Context Protocol) for test execution.

## 🚀 Features

### Core Functionality
- **Test Pack Management** - Create, categorize, and manage test prompts
- **MCP Integration** - Execute tests through Cursor's Playwright MCP server
- **Local Storage** - No backend required, all data stored in browser
- **Visual Reports** - Charts and analytics for test execution results
- **Bug Tracking** - Link bugs to failed test executions
- **Real-time Updates** - WebSocket connection for live test status

### Test Categories
- Functional
- Regression
- System Integration
- Smoke Test
- Performance

## 🔧 How It Works

### 1. Create Test Packs
Navigate to "Test Packs" and create your test prompts with:
- Test name
- Test type/category
- Feature/module
- Test instructions (prompt)
- Expected results

### 2. Execute Tests with MCP

#### Automated Execution (Recommended)
With the MCP Bridge Server running:
1. Click "Execute" on a test
2. The system automatically:
   - Opens Cursor IDE with a markdown file containing your test prompt
   - Copies the prompt to clipboard as fallback
   - Sends the test to Cursor's Playwright MCP
   - Updates the test status when complete
3. Real-time updates via WebSocket connection

#### Manual Execution (Fallback)
If the bridge server is not running:
1. Click "Execute" on a test
2. The test prompt is copied to your clipboard
3. A modal appears with instructions
4. Switch to Cursor IDE and paste the prompt
5. Execute the test manually
6. Return to AgenticQA to record the results

### 3. View Reports
The Reports section shows:
- Total tests count
- Pass rate percentage
- Active bugs count
- Visual charts of test results

### 4. Track Bugs
Failed tests can have associated bugs that are tracked and managed in the Bugs section.

## 🚀 MCP Bridge Server Setup

### Prerequisites
- Node.js installed on your system
- Cursor IDE with Playwright MCP configured

### Starting the Bridge Server

#### Windows:
```bash
# Run the setup script
setup-bridge.bat
```

#### Mac/Linux:
```bash
# Make the script executable (first time only)
chmod +x setup-bridge.sh

# Run the setup script
./setup-bridge.sh
```

The bridge server will:
- Install required dependencies
- Start on http://localhost:3001
- Enable WebSocket connection on ws://localhost:3002
- Show connection status in the AgenticQA header

## 📋 Cursor Agent Mode Integration

For detailed information on how AgenticQA integrates with Cursor's Agent Mode, see the [Cursor Integration Guide](CURSOR_INTEGRATION.md).

### Quick Summary:
- AgenticQA creates a markdown file with your test prompt
- Cursor opens with this file
- Copy the content into Agent Mode to execute
- Results can be recorded automatically or manually

## 📋 MCP Integration Details

### Test Prompt Format
When a test is executed, the following formatted prompt is copied to clipboard:

```
Execute this Playwright test:

Test Name: [Test Name]
Test Type: [Test Type]
Module: [Module Name]

Test Instructions:
[Your test prompt]

Expected Results:
[Expected results]

Please:
1. Navigate to the appropriate page/URL
2. Perform the test actions as described
3. Verify the expected results
4. Return the test status (passed/failed/blocked) and any relevant screenshots or logs
```

### Cursor MCP Configuration
Ensure your Cursor IDE has the Playwright MCP server configured:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ],
      "autoAccept": true
    }
  }
}
```

## 🛠 Installation & Usage

1. Clone the repository:
   ```bash
   git clone https://github.com/RowenGopi87/AgenticQA.git
   cd AgenticQA
   ```

2. Open `index.html` in a web browser

3. (Optional) Start the MCP Bridge Server for automated execution:
   ```bash
   # Windows
   setup-bridge.bat
   
   # Mac/Linux
   ./setup-bridge.sh
   ```

4. Start creating and executing tests!

## 💾 Data Storage

All data is stored in browser localStorage with the following keys:
- `agenticqa_tests` - Test definitions
- `agenticqa_executions` - Test execution history
- `agenticqa_bugs` - Bug reports

## 🎨 Technology Stack

- **Frontend**: HTML5, Tailwind CSS
- **JavaScript**: Vanilla JS (no framework dependencies)
- **Icons**: Feather Icons
- **Charts**: Chart.js
- **Font**: Inter (Google Fonts)
- **Bridge Server**: Node.js, Express, WebSocket

## 📝 Future Enhancements

- [ ] Direct API integration with Cursor MCP
- [ ] Test execution trends over time
- [ ] Date range filters for reports
- [ ] Data export/import functionality
- [ ] Performance optimizations for large datasets

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License. 