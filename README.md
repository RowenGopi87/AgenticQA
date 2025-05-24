# AgenticQA - Test Management MVP with MCP Integration

A modern, lightweight test management system that leverages browser local storage and integrates with Cursor's Playwright MCP (Model Context Protocol) for test execution.

## 🚀 Features

### Core Functionality
- **Test Pack Management** - Create, categorize, and manage test prompts
- **MCP Integration** - Execute tests through Cursor's Playwright MCP server
- **Local Storage** - No backend required, all data stored in browser
- **Visual Reports** - Charts and analytics for test execution results
- **Bug Tracking** - Link bugs to failed test executions

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
When you click "Execute" on a test:
1. The test prompt is automatically copied to your clipboard
2. A modal appears with instructions
3. Switch to Cursor IDE and paste the prompt
4. Cursor's Playwright MCP executes the test
5. Return to AgenticQA to record the results

### 3. View Reports
The Reports section shows:
- Total tests count
- Pass rate percentage
- Active bugs count
- Visual charts of test results

### 4. Track Bugs
Failed tests can have associated bugs that are tracked and managed in the Bugs section.

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

3. Start creating and executing tests!

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