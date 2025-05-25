# Cursor Agent Mode Integration Guide

## Overview

AgenticQA integrates with Cursor's Agent Mode to enable automated test execution using Playwright. Based on the [Cursor Agent Mode documentation](https://docs.cursor.com/chat/agent), Agent Mode is designed as an autonomous AI coding agent with full tool access.

## Current Integration Approach

Since Cursor doesn't currently provide a direct API to programmatically populate Agent Mode prompts, AgenticQA uses several approaches:

### 1. File-Based Integration (Primary Method)
When you click "Execute" on a test, AgenticQA:
- Creates a temporary markdown file with your test prompt
- Opens Cursor with this file
- The file contains formatted test instructions that you can copy into Agent Mode

### 2. Clipboard Integration (Fallback)
If the file method fails:
- The test prompt is copied to your clipboard
- Cursor opens normally
- You can paste the prompt directly into Agent Mode

### 3. Future Integration (MCP)
Once Cursor's Model Context Protocol (MCP) API is fully available:
- Direct prompt injection will be possible
- Automated result collection
- Real-time status updates

## Using Agent Mode for Test Execution

### Step 1: Start the Bridge Server
```bash
# Windows
setup-bridge.bat

# Mac/Linux
./setup-bridge.sh
```

### Step 2: Execute a Test
1. Click "Execute" on any test in AgenticQA
2. Cursor will open with one of these scenarios:
   - **Best Case**: A markdown file opens with your test prompt
   - **Fallback**: Cursor opens and the prompt is in your clipboard

### Step 3: Run in Agent Mode
1. Open Cursor's Agent Mode (default mode)
2. If a file opened: Copy the content to Agent Mode
3. If no file: Paste from clipboard (Ctrl/Cmd + V)
4. Let Agent Mode execute the test autonomously

### Step 4: Record Results
- **Automated** (when bridge server is running): Results update automatically
- **Manual**: Return to AgenticQA and record results in the modal

## Prompt Format

AgenticQA generates prompts optimized for Agent Mode:

```markdown
Execute this Playwright test:

Test Name: [Your Test Name]
Test Type: [Category]
Module: [Feature/Module]

Test Instructions:
[Your detailed test steps]

Expected Results:
[What should happen]

Please:
1. Navigate to the appropriate page/URL
2. Perform the test actions as described
3. Verify the expected results
4. Return the test status (passed/failed/blocked) and any relevant screenshots or logs
```

## Agent Mode Capabilities

According to Cursor's documentation, Agent Mode will:
1. **Understand the Request** - Analyze your test requirements
2. **Explore Codebase** - Find relevant files and context
3. **Plan Changes** - Break down the test into steps
4. **Execute Changes** - Run the Playwright test
5. **Verify Results** - Confirm the test execution

## Best Practices

1. **Be Specific**: Include clear, detailed test instructions
2. **Include Context**: Mention specific URLs, selectors, or data
3. **Expected Results**: Be explicit about what constitutes success
4. **Let Agent Work**: Agent Mode is autonomous - let it explore and execute

## Troubleshooting

### Cursor Doesn't Open
- Ensure Cursor is installed in the default location
- Try running `cursor` from command line to verify installation
- Check the bridge server logs for errors

### Prompt Doesn't Appear
- Check if a markdown file opened in Cursor
- Try the clipboard method (Ctrl/Cmd + V in Agent Mode)
- Ensure the bridge server is running

### Test Doesn't Execute
- Verify Playwright MCP is configured in Cursor
- Check that Agent Mode has all tools enabled
- Review the test prompt for clarity

## Future Enhancements

As Cursor's API evolves, we plan to:
- Direct API integration for prompt injection
- Automated result extraction from Agent Mode
- Real-time test execution monitoring
- Screenshot and log capture

## References

- [Cursor Agent Mode Documentation](https://docs.cursor.com/chat/agent)
- [Model Context Protocol](https://docs.cursor.com/context/model-context-protocol) 