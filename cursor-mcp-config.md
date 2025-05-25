# Cursor IDE MCP Configuration

## Method 1: Using Cursor Settings UI (Recommended)

1. **Open Cursor Settings**
   - Go to `Cursor Settings` → `Features` → `MCP Servers`
   - Click `Add new MCP Server`

2. **Configure Playwright MCP**
   - **Name**: `playwright`
   - **Command Type**: Select `command`
   - **Command**: `npx`
   - **Arguments**: `@playwright/mcp@latest`

3. **Save and Restart**
   - Click `Save`
   - Restart Cursor IDE

## Method 2: Manual JSON Configuration

1. **Create MCP Config Directory**
   - Windows: `C:\Users\{YourUsername}\.cursor\`
   - macOS: `~/.cursor/`
   - Linux: `~/.cursor/`

2. **Create mcp.json file**
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

3. **Restart Cursor**
   - Close and reopen Cursor IDE
   - Or use `Developer: Reload Window` from Command Palette

## Verification

1. **Check MCP Status**
   - Open Cursor Settings → Features → MCP Servers
   - You should see "playwright" listed and connected

2. **Test in Chat**
   - Open Cursor Chat (Cmd/Ctrl + I)
   - Type: "What MCP tools do you have available?"
   - You should see Playwright browser automation tools listed

## Available Playwright MCP Tools

Once configured, you'll have access to these tools:
- `browser_navigate` - Navigate to URLs
- `browser_snapshot` - Take page snapshots
- `browser_click` - Click elements
- `browser_type` - Type text
- `browser_take_screenshot` - Capture screenshots
- `browser_wait_for` - Wait for conditions
- And many more browser automation tools 