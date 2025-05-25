# Playwright MCP Integration Guide for AgenticQA

## Overview

This guide explains how to integrate AgenticQA with Playwright MCP for automated browser testing.

## Setup Options

### Option 1: Direct Browser Integration (Recommended)

1. **Install Playwright MCP Server**
   ```bash
   npm install -g @playwright/mcp
   ```

2. **Start the MCP Server**
   ```bash
   playwright-mcp --port 3000 --cors
   ```

3. **Configure AgenticQA**
   - The MCP integration script will automatically detect the server
   - Tests will execute directly in the browser when you click "Execute"

### Option 2: Through Cursor IDE

1. **Enable Playwright MCP in Cursor**
   - Open Cursor Settings
   - Go to Extensions → MCP
   - Enable Playwright MCP

2. **Use the Test Prompt Format**
   ```javascript
   // Copy this format from AgenticQA
   Execute the following test using Playwright:
   
   Test Name: [Your Test Name]
   Module: [Module Name]
   Type: [Test Type]
   
   Test Steps:
   [Your test steps in natural language]
   
   Expected Results:
   [Expected outcomes]
   ```

3. **Execute in Cursor**
   - Paste the prompt in Cursor
   - The AI will generate and execute Playwright code
   - Copy the results back to AgenticQA

## Test Prompt Examples

### Example 1: Login Test
```
Execute the following test using Playwright:

Test Name: User Login Test
Module: Authentication
Type: Functional

Test Steps:
1. Navigate to https://example.com/login
2. Enter "testuser@example.com" in the email field
3. Enter "password123" in the password field
4. Click the "Login" button
5. Wait for navigation to complete

Expected Results:
- User should be redirected to dashboard
- Welcome message should display user's name
- Navigation menu should show authenticated options
```

### Example 2: Search Functionality Test
```
Execute the following test using Playwright:

Test Name: Product Search Test
Module: Search
Type: Functional

Test Steps:
1. Navigate to https://example.com
2. Click on the search bar
3. Type "laptop" and press Enter
4. Wait for search results to load
5. Verify results are displayed
6. Click on the first result

Expected Results:
- Search results should contain items related to "laptop"
- Each result should have title, price, and image
- Clicking a result should navigate to product details page
```

## MCP Response Format

The MCP server returns results in this format:

```json
{
  "status": "passed",
  "duration": 5234,
  "steps": [
    {
      "action": "Navigate to login page",
      "status": "passed",
      "duration": 1200,
      "screenshot": "data:image/png;base64,..."
    },
    {
      "action": "Enter credentials",
      "status": "passed",
      "duration": 500
    }
  ],
  "logs": [
    "Test started at 2024-01-15 10:30:00",
    "Navigation successful",
    "Login completed"
  ],
  "validationResults": {
    "passed": true,
    "details": "All assertions passed"
  }
}
```

## Troubleshooting

### MCP Server Not Detected
- Ensure the server is running on port 3000
- Check firewall settings
- Try accessing http://localhost:3000/status in your browser

### CORS Issues
- Start the MCP server with `--cors` flag
- Use a browser extension to disable CORS for localhost (development only)

### Test Execution Fails
- Check the browser console for errors
- Ensure test steps are clear and specific
- Verify selectors and URLs are correct

## Advanced Configuration

### Custom MCP Server URL
```javascript
// In your browser console or add to app.js
window.AgenticQAMCP.init({
  mcpServerUrl: 'http://localhost:8080',
  timeout: 120000 // 2 minutes
});
```

### Headless Mode
Configure in the test prompt:
```
Options:
- Run in headless mode
- Capture screenshots for each step
- Set timeout to 30 seconds
```

## Security Considerations

1. **Local Only**: MCP server should only be accessible from localhost
2. **Authentication**: Consider adding authentication to the MCP server
3. **Input Validation**: Validate test prompts before execution
4. **Sandboxing**: Run tests in isolated browser contexts 