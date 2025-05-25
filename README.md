# AgenticQA - Test Management MVP with Direct MCP Integration

A modern, lightweight test management system that leverages browser local storage and integrates directly with a Playwright MCP (Model Context Protocol) server for automated test execution via a local bridge server.

## 🚀 Features

### Core Functionality
- **Test Pack Management** - Create, categorize, and manage test prompts
- **Direct MCP Execution** - Execute tests via a bridge server that communicates directly with a Playwright MCP process
- **Local Storage** - No backend required, all data stored in browser
- **Visual Reports** - Charts and analytics for test execution results
- **Bug Tracking** - Link bugs to failed test executions
- **Real-time Updates** - WebSocket connection for live test status and bridge server status

### Test Categories
- Functional
- Regression
- System Integration
- Smoke Test
- Performance

## 🔧 How It Works

### 1. Start the MCP Bridge Server
Run the appropriate setup script (`setup-bridge.bat` or `setup-bridge.sh`). This server:
- Spawns and manages a Playwright MCP process (`npx @playwright/mcp@latest`).
- Listens for API requests from the AgenticQA web application.
- Communicates with the Playwright MCP process via `stdin`/`stdout`.
- Provides real-time updates to the web app via WebSockets.

### 2. Open AgenticQA Web App
Open `index.html` in your browser. The header will indicate the connection status to the MCP Bridge Server.

### 3. Create Test Packs
Navigate to "Test Packs" and create your test prompts with:
- Test name
- Test type/category
- Feature/module
- Test instructions (prompt)
- Expected results

### 4. Execute Tests Directly via MCP
When you click "Execute" on a test (and the bridge server is connected):
1. AgenticQA sends the test details to the MCP Bridge Server.
2. The Bridge Server formats the test into a JSON prompt and sends it to the Playwright MCP process's `stdin`.
3. The Playwright MCP process executes the test based on the prompt.
4. Results (status, duration, logs, screenshots if captured by MCP) are sent back to the Bridge Server via `stdout`.
5. The Bridge Server relays these results to AgenticQA via WebSocket.
6. AgenticQA updates the UI with the execution status and details automatically.

### 5. View Reports & Track Bugs
As before, the Reports and Bugs sections allow you to analyze results and manage issues.

## 🚀 MCP Bridge Server Setup

### Prerequisites
- Node.js installed on your system.

### Starting the Bridge Server

#### Windows:
```bash
# Run the setup script (installs dependencies and starts the server)
setup-bridge.bat
```

#### Mac/Linux:
```bash
# Make the script executable (first time only)
chmod +x setup-bridge.sh

# Run the setup script (installs dependencies and starts the server)
./setup-bridge.sh
```

The bridge server will:
- Install required dependencies (`express`, `cors`, `ws`).
- Start on `http://localhost:3001`.
- Enable WebSocket connection on `ws://localhost:3002`.
- Attempt to spawn and manage the `npx @playwright/mcp@latest` process.
- Show connection status in the AgenticQA header.

## 📋 Playwright MCP Communication

- **Input to MCP**: The bridge server sends a JSON object to the Playwright MCP process's `stdin`. The structure is assumed to be (and can be adapted):
  ```json
  {
    "command_id": "cmd_1234567890",
    "command": "run_playwright_test",
    "test_name": "Test Name",
    "test_module": "Module Name",
    "steps": [
      { "stepNumber": 1, "action": "Navigate to google.com", "screenshot": true },
      { "stepNumber": 2, "action": "Search for Playwright", "screenshot": true }
    ],
    "expected_results_description": "Search results for Playwright should be displayed",
    "options": {
      "capture_screenshots_for_steps": true,
      "validate_results_against_description": true
    }
  }
  ```
- **Output from MCP**: The bridge server expects a JSON response from the Playwright MCP process's `stdout`. The structure is assumed to be (and can be adapted):
  ```json
  {
    "command_id": "cmd_1234567890",
    "overall_status": "passed", // "failed", "blocked"
    "total_duration_ms": 5200,
    "step_results": [
      {
        "step_number": 1,
        "action": "Navigate to google.com",
        "status": "passed",
        "duration_ms": 1200,
        "screenshot_path": "screenshots/step1.png", // if captured
        "screenshot_base64": "...", // if captured and returned
        "logs": ["Navigation successful"]
      }
    ],
    "logs": ["Test execution started", "Test execution finished"],
    "validation": {
      "passed": true,
      "details": "All expected results matched"
    } 
  }
  ```

**Note**: The `sendToMCP` function in `mcp-bridge-server.js` currently simulates this response. It needs to be updated with the actual communication protocol of `@playwright/mcp@latest` when known.

## 🛠 Installation & Usage

1. Clone the repository:
   ```bash
   git clone https://github.com/RowenGopi87/AgenticQA.git
   cd AgenticQA
   ```
2. Start the MCP Bridge Server:
   ```bash
   # Windows
   setup-bridge.bat
   
   # Mac/Linux
   ./setup-bridge.sh
   ```
3. Open `index.html` in a web browser.
4. Verify "Bridge Connected" status in the header.
5. Start creating and executing tests!

## 💾 Data Storage
All data is stored in browser localStorage.

## 🎨 Technology Stack
- **Frontend**: HTML5, Tailwind CSS, Vanilla JS
- **Icons**: Feather Icons
- **Charts**: Chart.js
- **Bridge Server**: Node.js, Express, WebSocket

## 📝 Future Enhancements
- Refine `sendToMCP` in the bridge server with the actual Playwright MCP communication protocol.
- More detailed error handling and reporting from MCP.
- UI for viewing step-by-step results and screenshots from MCP.
- Test execution trends over time.
- Data export/import functionality.

## 🤝 Contributing
Feel free to submit issues and enhancement requests!

## 📄 License
This project is open source and available under the MIT License. 