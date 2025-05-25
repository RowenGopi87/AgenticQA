# AgenticQA + Cursor IDE Quick Start Guide

## Prerequisites

1. **Cursor IDE** installed and running
2. **Playwright MCP** configured in Cursor (see cursor-mcp-config.md)
3. **AgenticQA** open in your browser

## Workflow

### 1. Create a Test in AgenticQA

1. Open AgenticQA in your browser
2. Go to "Test Packs" tab
3. Click "Add New Test"
4. Fill in test details:
   - **Name**: "Login Test"
   - **Type**: "Functional"
   - **Module**: "Authentication"
   - **Test Prompt**: 
     ```
     1. Navigate to https://example.com/login
     2. Enter "test@example.com" in the email field
     3. Enter "password123" in the password field
     4. Click the "Login" button
     5. Verify successful login
     ```
   - **Expected Results**: "User should be redirected to dashboard"

### 2. Execute Test via Cursor IDE

1. In AgenticQA, go to "Execute" tab
2. Find your test and click "Execute"
3. Copy the generated prompt from the modal
4. Open Cursor IDE
5. Open Chat (Cmd/Ctrl + I)
6. Paste the prompt and press Enter
7. Cursor will use Playwright MCP tools to execute the test

### 3. Copy Results Back to AgenticQA

1. Once Cursor completes the test execution, copy the JSON results
2. Go back to AgenticQA execution modal
3. Paste the results in the "Execution Results" textarea
4. Click "Save Results"

## Example Test Prompts

### Login Test
```
1. Navigate to https://demo.opencart.com/admin/
2. Enter "demo" in the username field
3. Enter "demo" in the password field
4. Click the "Login" button
5. Verify the dashboard loads successfully
```

### Search Test
```
1. Navigate to https://demo.opencart.com/
2. Click on the search input field
3. Type "MacBook" and press Enter
4. Verify search results are displayed
5. Click on the first product result
```

### Form Submission Test
```
1. Navigate to https://demo.opencart.com/index.php?route=account/register
2. Fill in the registration form:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@example.com"
   - Password: "password123"
3. Check the privacy policy checkbox
4. Click "Continue" button
5. Verify account creation success
```

## Tips for Better Results

### 1. Be Specific with Selectors
Instead of: "Click the button"
Use: "Click the button with text 'Login'"

### 2. Include Wait Conditions
```
1. Navigate to the page
2. Wait for the page to fully load
3. Wait for the login form to be visible
4. Enter credentials
```

### 3. Add Verification Steps
```
1. Perform action
2. Take screenshot for evidence
3. Verify expected element is visible
4. Check for success message
```

### 4. Handle Dynamic Content
```
1. Wait for loading spinner to disappear
2. Wait for data to load (up to 10 seconds)
3. Verify content is displayed
```

## Troubleshooting

### MCP Not Working
- Check Cursor Settings → Features → MCP Servers
- Ensure Playwright MCP is listed and connected
- Restart Cursor if needed

### Test Execution Fails
- Make sure URLs are accessible
- Check if selectors are correct
- Verify the website is responsive

### Results Not Parsing
- Ensure JSON format is correct
- Check for syntax errors in the response
- Use plain text status if JSON fails

## Advanced Usage

### Custom Browser Options
You can request specific browser configurations:
```
Please execute this test with the following options:
- Use Chrome browser
- Set viewport to 1920x1080
- Disable images for faster loading
- Run in headed mode (visible browser)
```

### Multiple Screenshots
```
1. Take screenshot of initial state
2. Perform action
3. Take screenshot after each major step
4. Include all screenshots in the results
```

### Performance Testing
```
1. Measure page load time
2. Record network requests
3. Check for console errors
4. Verify performance metrics
``` 