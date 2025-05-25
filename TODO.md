# AgenticQA MVP - TODO List

## ✅ Completed Tasks
- [x] Initialize git repository
- [x] Create Hello World HTML page with Tailwind CSS
- [x] Create navigation structure (Test Packs, Execute, Reports)
- [x] Set up basic routing/page switching
- [x] Design responsive layout
- [x] Create form to add/edit test prompts
- [x] Implement test categorization (test type, feature/module)
- [x] Add expected results input field
- [x] Implement localStorage save/load functionality
- [x] Create test list view with edit/delete options
- [x] Design API call structure for MCP integration
- [x] Implement test execution trigger
- [x] Handle execution response (status, duration, screenshots)
- [x] Update test status in real-time
- [x] Create MCP Bridge Server for direct Playwright MCP communication
- [x] Implement WebSocket for real-time updates between web app and bridge server
- [x] Add bridge server status indicator to UI
- [x] Implement direct test execution flow via bridge to Playwright MCP
- [x] Spawn and manage Playwright MCP process from bridge server
- [x] Communicate with MCP process via stdin/stdout
- [x] Create results storage structure in localStorage
- [x] Build results table with sorting/filtering
- [x] Display execution history per test
- [x] Show test metadata (duration, screenshots, logs)
- [x] Create bug logging form
- [x] Link bugs to failed test runs
- [x] Store bug data in localStorage
- [x] Display bugs associated with tests
- [x] Integrate Chart.js library
- [x] Create pass/fail/blocked status bar chart
- [x] Add confirmation dialogs for delete operations

## 📋 Pending Tasks

### Visual Reporting Section
- [ ] Build test execution trends line chart
- [ ] Implement date range filters
- [ ] Add test type filters
- [ ] Create execution duration analytics

### Final Polish & MCP Refinement
- [ ] Refine `sendToMCP` in bridge server with actual Playwright MCP I/O protocol
- [ ] Implement robust error handling for MCP communication
- [ ] Design UI for displaying detailed step-by-step results from MCP (including screenshots)
- [ ] Add data export functionality
- [ ] Implement data import capability
- [ ] Create help/documentation section within the app
- [ ] Performance optimization for large datasets 