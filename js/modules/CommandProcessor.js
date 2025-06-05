import { SearchProviders } from "../utils/SearchProviders.js";
import { Utils } from "../utils/Utils.js";
import { SystemInfo } from "./SystemInfo.js";

export class CommandProcessor {
  constructor(state, ui, bookmarkManager) {
    this.state = state;
    this.ui = ui;
    this.bookmarkManager = bookmarkManager;
    this.searchProviders = new SearchProviders();
    this.systemInfo = new SystemInfo(state);
  }

  async executeCommand(command) {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    this.state.addToHistory(trimmedCommand);
    this.ui.clearOutput();
    this.ui.showOutput(`arch@zen-browser:~$ ${trimmedCommand}`, "info");

    const parts = trimmedCommand.split(" ");
    const cmd = parts[0].toLowerCase();

    try {
      await this.routeCommand(cmd, parts);
    } catch (error) {
      console.error("Command execution failed:", error);
      this.ui.showOutput("Command execution failed", "error");
    }

    this.ui.clearInput();
  }

  async routeCommand(cmd, parts) {
    const commands = {
      help: () => this.showHelp(),
      clear: () => this.ui.clearOutput(),
      import: () => this.handleImport(),
      export: () => this.bookmarkManager.exportToHTML(),
      neofetch: () => this.systemInfo.display(this.ui),
      fastfetch: () => this.systemInfo.display(this.ui),
      ff: () => this.systemInfo.display(this.ui),
    };

    if (commands[cmd]) {
      commands[cmd]();
    } else if (this.searchProviders.isSearchCommand(cmd)) {
      this.handleSearch(cmd, parts.slice(1).join(" "));
    } else if (Utils.isURL(parts.join(" "))) {
      this.handleURL(parts.join(" "));
    } else {
      this.handleBookmark(cmd);
    }
  }

  handleSearch(provider, searchTerm) {
    if (!searchTerm.trim()) {
      this.ui.showOutput(
        `Error: Please provide a search term. Example: ${provider} search query`,
        "error",
      );
      return;
    }

    const searchURL = this.searchProviders.getSearchURL(provider, searchTerm);
    const providerName = this.searchProviders.getProviderName(provider);

    this.bookmarkManager.openBookmark(searchURL);
    this.ui.showOutput(
      `Searching ${providerName} for: "${searchTerm}"`,
      "success",
    );
  }

  handleURL(url) {
    const normalizedURL = Utils.normalizeURL(url);
    this.bookmarkManager.openBookmark(normalizedURL);
    this.ui.showOutput(`Opening URL: ${normalizedURL}`, "success");
  }

  handleBookmark(query) {
    const bookmark = this.bookmarkManager.findBookmark(query);

    if (bookmark) {
      this.bookmarkManager.openBookmark(bookmark.url);
      this.ui.showOutput(`Opening: ${bookmark.title}`, "success");
    } else {
      this.ui.showOutput(
        `Bookmark not found: ${query}. Type 'help' for available commands.`,
        "error",
      );
    }
  }

  handleImport() {
    this.ui.elements.fileInput.click();
    this.ui.showOutput(
      "File dialog opened. Select your bookmark HTML file.",
      "info",
    );
  }

  showHelp() {
    const helpText = `Available commands:
  <bookmark_name> - Open bookmark by typing its name directly
  <url>           - Open URL directly (e.g., netflix.com, https://google.com)
  import          - Import bookmarks from HTML file
  export          - Export bookmarks to HTML file
  neofetch        - Show system information
  help            - Show this help message
  clear           - Clear terminal output

Search commands:
  b <query>       - Search Brave for query
  g <query>       - Search Google for query
  y <query>       - Search YouTube for query
  r <query>       - Search Reddit for query

Keyboard shortcuts:
  dd              - Clear input (double-tap 'd')
  Tab             - Autocomplete bookmark names
  ↑/↓             - Navigate command history
  Escape          - Clear autocomplete

Note: Use Tab for autocomplete and cycling through bookmark options`;

    this.ui.showOutput(helpText, "info");
  }
}
