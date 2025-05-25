# AgenticQA Browser Extension Setup

This browser extension enables automatic communication between AgenticQA and Cursor IDE, eliminating the need to manually copy prompts.

## Installation

### Step 1: Prepare Extension Files

1. Navigate to the `browser-extension` folder in your AgenticQA project
2. Create placeholder icon files (or download real icons):
   ```
   browser-extension/
   ├── manifest.json
   ├── background.js
   ├── content.js
   ├── popup.html (optional)
   ├── icon16.png
   ├── icon48.png
   └── icon128.png
   ```

### Step 2: Install in Chrome/Edge

1. **Open Extension Management**
   - Chrome: Go to `chrome://extensions/`
   - Edge: Go to `edge://extensions/`

2. **Enable Developer Mode**
   - Toggle "Developer mode" in the top right corner

3. **Load Extension**
   - Click "Load unpacked"
   - Select the `browser-extension` folder
   - The extension should appear in your extensions list

4. **Pin Extension** (Optional)
   - Click the puzzle piece icon in the browser toolbar
   - Pin "AgenticQA MCP Bridge" for easy access

### Step 3: Grant Permissions

When you first use the extension, it will request permissions for:
- **Notifications**: To show test execution status
- **Clipboard**: To copy prompts automatically
- **Active Tab**: To communicate with AgenticQA

## Usage

### Automatic Mode (When Extension is Installed)

1. **Create Test in AgenticQA**
   - Open AgenticQA in your browser
   - Create a new test with your instructions

2. **Execute Test**
   - Click "Execute" on any test
   - The extension will automatically:
     - Copy the prompt to clipboard
     - Show a notification
     - Attempt to communicate with Cursor (if API available)

3. **In Cursor IDE**
   - Open Cursor Chat (Ctrl+I)
   - Paste the prompt (Ctrl+V)
   - Execute the test

4. **Return Results**
   - Copy the JSON results from Cursor
   - Paste back into AgenticQA execution modal

### Status Indicators

The AgenticQA header shows the current integration status:

- 🟢 **Cursor Bridge Ready**: Extension installed and working
- 🟡 **MCP Available**: Direct MCP integration available
- ⚪ **Manual Mode**: No automation available

## Features

### Clipboard Integration
- Automatically copies test prompts to clipboard
- Shows browser notifications when ready
- No manual copying required

### Cursor Communication
- Attempts direct API communication with Cursor IDE
- Falls back to clipboard method if API unavailable
- Provides clear status feedback

### Smart Fallbacks
- Extension → Direct MCP → Manual mode
- Always provides a working execution path
- Graceful degradation when services unavailable

## Troubleshooting

### Extension Not Working
1. **Check Installation**
   - Verify extension appears in `chrome://extensions/`
   - Ensure it's enabled (toggle switch is on)

2. **Check Permissions**
   - Click on extension details
   - Verify all permissions are granted

3. **Reload Extension**
   - Click the refresh icon on the extension card
   - Reload the AgenticQA page

### Notifications Not Showing
1. **Check Browser Settings**
   - Ensure notifications are enabled for your browser
   - Check site-specific notification permissions

2. **Test Notifications**
   - Right-click the extension icon
   - Look for notification test options

### Clipboard Not Working
1. **HTTPS Required**
   - Clipboard API requires HTTPS or localhost
   - Ensure AgenticQA is served over HTTPS

2. **Browser Permissions**
   - Some browsers require explicit clipboard permission
   - Check site permissions in browser settings

## Advanced Configuration

### Custom Cursor API Port
If Cursor runs on a different port, you can modify the extension:

1. Edit `browser-extension/background.js`
2. Change the API URL:
   ```javascript
   const CURSOR_API_URL = 'http://localhost:YOUR_PORT';
   ```

### Disable Notifications
To disable notifications while keeping clipboard functionality:

1. Edit `browser-extension/background.js`
2. Comment out the `chrome.notifications.create()` calls

## Security Notes

- Extension only runs on pages you visit
- No data is sent to external servers
- All communication is local (browser ↔ Cursor)
- Clipboard access is limited to test prompts

## Uninstallation

1. Go to `chrome://extensions/` or `edge://extensions/`
2. Find "AgenticQA MCP Bridge"
3. Click "Remove"
4. Confirm removal

The extension leaves no traces after removal. 