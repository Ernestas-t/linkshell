class HackerStartpage {
  constructor() {
    this.bookmarks = [];
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentCompletion = null;
    this.possibleCompletions = [];
    this.completionIndex = -1;
    this.searchProviders = {
      b: {
        name: "Brave",
        url: "https://search.brave.com/search?q=",
      },
      g: {
        name: "Google",
        url: "https://www.google.com/search?q=",
      },
      y: {
        name: "YouTube",
        url: "https://www.youtube.com/results?search_query=",
      },
      r: {
        name: "Reddit",
        url: "https://www.reddit.com/search/?q=",
      },
    };
    this.init();
  }

  init() {
    const commandInput = document.getElementById("commandInput");
    const fileInput = document.getElementById("bookmarkFile");

    commandInput.addEventListener("input", (e) => this.handleInput(e));
    commandInput.addEventListener("keydown", (e) => this.handleKeydown(e));
    fileInput.addEventListener("change", (e) => this.handleFileUpload(e));

    // Load bookmarks from localStorage
    this.loadFromStorage();

    // Show welcome message
    this.showWelcome();

    commandInput.focus();
  }

  showWelcome() {
    const output = document.getElementById("output");
    output.innerHTML = `<div class="output info">Type 'help' for available commands</div>`;
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        this.parseBookmarksFromHTML(e.target.result);
        this.saveToStorage();
        this.renderBookmarksAsLS();
        document.getElementById("importSection").style.display = "none";
        this.showOutput(
          `Successfully imported ${this.bookmarks.length} bookmarks`,
          "success",
        );
        // Clear the file input for future imports
        event.target.value = "";
      } catch (error) {
        this.showOutput("Error: Invalid bookmark file format", "error");
        console.error("Parse error:", error);
      }
    };
    reader.readAsText(file);
  }

  parseBookmarksFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    this.bookmarks = [];
    this.extractBookmarksFromNode(doc.body);
  }

  extractBookmarksFromNode(node) {
    const links = node.querySelectorAll("a[href]");

    links.forEach((link) => {
      if (link.href && link.href.startsWith("http")) {
        this.bookmarks.push({
          title: link.textContent.trim() || link.href,
          url: link.href,
          name: this.sanitizeName(link.textContent.trim() || link.href),
        });
      }
    });
  }

  sanitizeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 30);
  }

  renderBookmarksAsLS() {
    const container = document.getElementById("bookmarkList");

    if (this.bookmarks.length === 0) {
      container.innerHTML =
        '<div class="no-bookmarks">No bookmarks found. Import bookmarks to get started.</div>';
      return;
    }

    // Sort bookmarks alphabetically like ls command
    const sortedBookmarks = [...this.bookmarks].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    const html = sortedBookmarks
      .map(
        (bookmark) =>
          `<div class="bookmark-item executable" data-name="${bookmark.name}" data-url="${bookmark.url}">
                        ${bookmark.name}
                    </div>`,
      )
      .join("");

    container.innerHTML = html;

    // Add click listeners
    container.querySelectorAll(".bookmark-item").forEach((item) => {
      item.addEventListener("click", () => {
        const url = item.getAttribute("data-url");
        this.openBookmark(url);
      });
    });
  }

  handleInput(event) {
    const input = event.target.value;
    this.updateAutocomplete(input);
    // Reset completion cycling when input changes
    this.completionIndex = -1;
  }

  updateAutocomplete(input) {
    // Remove existing preview
    this.removeAutocompletePreview();

    if (!input.trim()) {
      this.possibleCompletions = [];
      return;
    }

    // Don't show autocomplete for URLs or search commands
    if (this.isURL(input) || this.isSearchCommand(input)) {
      this.possibleCompletions = [];
      return;
    }

    // Find all matching bookmarks
    const query = input.toLowerCase();
    this.possibleCompletions = this.bookmarks
      .filter((bookmark) => bookmark.name.startsWith(query))
      .map((bookmark) => bookmark.name)
      .sort();

    if (this.possibleCompletions.length > 0) {
      // Find common prefix among all matches
      const commonPrefix = this.findCommonPrefix(this.possibleCompletions);

      if (commonPrefix.length > input.length) {
        // Show the common prefix completion
        this.showAutocompletePreview(input, commonPrefix);
        this.currentCompletion = commonPrefix;
      } else if (this.possibleCompletions.length === 1) {
        // Only one match, show it
        this.showAutocompletePreview(input, this.possibleCompletions[0]);
        this.currentCompletion = this.possibleCompletions[0];
      }
    } else {
      this.currentCompletion = null;
    }
  }

  isURL(input) {
    // Check if input looks like a URL
    const urlPattern = /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/;
    return urlPattern.test(input.trim());
  }

  isSearchCommand(input) {
    // Check if input is a search command (e.g., "g search term" or "y music")
    const searchPattern = /^[bgyr]\s+.+/;
    return searchPattern.test(input.trim());
  }

  normalizeURL(url) {
    // Add https:// if no protocol is specified
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
    return url;
  }

  findCommonPrefix(strings) {
    if (strings.length === 0) return "";
    if (strings.length === 1) return strings[0];

    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (strings[i].indexOf(prefix) !== 0) {
        prefix = prefix.substring(0, prefix.length - 1);
        if (prefix === "") return prefix;
      }
    }
    return prefix;
  }

  showAutocompletePreview(typed, completion) {
    const promptLine = document.querySelector(".prompt-line:nth-child(3)");
    const commandInput = document.getElementById("commandInput");

    // Get only the remaining part that hasn't been typed yet
    const remaining = completion.substring(typed.length);

    if (!remaining) return; // Nothing left to show

    // Create preview element with only the remaining text
    const preview = document.createElement("span");
    preview.className = "autocomplete-preview";
    preview.textContent = remaining;

    // Position it right where the cursor would be after the typed text
    preview.style.left = commandInput.offsetLeft + "px";
    preview.style.top = commandInput.offsetTop + "px";

    // Add padding to account for the typed text width (reduced spacing)
    preview.style.paddingLeft =
      this.getTextWidth(typed, commandInput) - 8 + "px";

    promptLine.appendChild(preview);
  }

  getTextWidth(text, element) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const style = window.getComputedStyle(element);
    context.font = style.font;
    return context.measureText(text).width;
  }

  removeAutocompletePreview() {
    const existing = document.querySelector(".autocomplete-preview");
    if (existing) {
      existing.remove();
    }
  }

  handleTabCompletion() {
    const input = document.getElementById("commandInput");
    const currentValue = input.value;

    if (this.possibleCompletions.length === 0) {
      return; // No completions available
    }

    if (this.possibleCompletions.length === 1) {
      // Only one match, complete it fully
      input.value = this.possibleCompletions[0];
      this.removeAutocompletePreview();
      this.currentCompletion = null;
      this.completionIndex = -1;
      return;
    }

    // Multiple matches - cycle through them or complete to common prefix
    if (this.currentCompletion && currentValue === this.currentCompletion) {
      // User has already completed to common prefix, start cycling
      this.completionIndex =
        (this.completionIndex + 1) % this.possibleCompletions.length;
      input.value = this.possibleCompletions[this.completionIndex];
      this.removeAutocompletePreview();
    } else if (this.currentCompletion) {
      // Complete to common prefix first
      input.value = this.currentCompletion;
      this.removeAutocompletePreview();
    }
  }

  handleKeydown(event) {
    const input = event.target;

    switch (event.key) {
      case "Enter":
        event.preventDefault();
        this.executeCommand(input.value);
        break;

      case "Tab":
        event.preventDefault();
        this.handleTabCompletion();
        break;

      case "ArrowUp":
        event.preventDefault();
        this.showPreviousCommand();
        break;

      case "ArrowDown":
        event.preventDefault();
        this.showNextCommand();
        break;

      case "Escape":
        this.removeAutocompletePreview();
        this.completionIndex = -1;
        break;

      default:
        // For any other key, update autocomplete after a brief delay
        setTimeout(() => this.updateAutocomplete(input.value), 0);
    }
  }

  executeCommand(command) {
    const trimmedCommand = command.trim();

    if (!trimmedCommand) return;

    // Remove autocomplete preview
    this.removeAutocompletePreview();
    this.completionIndex = -1;

    // Add to history
    this.commandHistory.push(trimmedCommand);
    this.historyIndex = this.commandHistory.length;

    // Clear previous output and show only the current command
    this.clearOutput();
    this.showOutput(`arch@zen-browser:~$ ${trimmedCommand}`, "info");

    // Parse and execute command
    const parts = trimmedCommand.split(" ");
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case "help":
        this.showHelp();
        break;
      case "clear":
        this.clearOutput();
        break;
      case "import":
        this.handleImportCommand();
        break;
      case "b":
      case "g":
      case "y":
      case "r":
        this.handleSearchCommand(cmd, parts.slice(1).join(" "));
        break;
      default:
        // Check if it's a URL first, then try bookmark
        if (this.isURL(trimmedCommand)) {
          this.handleURLOpen(trimmedCommand);
        } else {
          this.handleDirectBookmarkOpen(trimmedCommand);
        }
    }

    // Clear input
    document.getElementById("commandInput").value = "";
  }

  handleSearchCommand(provider, searchTerm) {
    if (!searchTerm.trim()) {
      this.showOutput(
        `Error: Please provide a search term. Example: ${provider} search query`,
        "error",
      );
      return;
    }

    const searchProvider = this.searchProviders[provider];
    const searchURL = searchProvider.url + encodeURIComponent(searchTerm);

    this.openBookmark(searchURL);
    this.showOutput(
      `Searching ${searchProvider.name} for: "${searchTerm}"`,
      "success",
    );
  }

  handleURLOpen(url) {
    const normalizedURL = this.normalizeURL(url);
    this.openBookmark(normalizedURL);
    this.showOutput(`Opening URL: ${normalizedURL}`, "success");
  }

  handleDirectBookmarkOpen(query) {
    const lowerQuery = query.toLowerCase();
    const bookmark = this.bookmarks.find(
      (b) => b.name === lowerQuery, // Only exact matches
    );

    if (bookmark) {
      this.openBookmark(bookmark.url);
      this.showOutput(`Opening: ${bookmark.title}`, "success");
    } else {
      this.showOutput(
        `Bookmark not found: ${query}. Type 'help' for available commands.`,
        "error",
      );
    }
  }

  openBookmark(url) {
    window.open(url, "_blank");
  }

  handleImportCommand() {
    // Trigger the file input
    const fileInput = document.getElementById("bookmarkFile");
    fileInput.click();
    this.showOutput(
      "File dialog opened. Select your bookmark HTML file.",
      "info",
    );
  }

  showHelp() {
    const helpText = `Available commands:
  <bookmark_name> - Open bookmark by typing its name directly
  <url>           - Open URL directly (e.g., netflix.com, https://google.com)
  import          - Import bookmarks from HTML file
  help            - Show this help message
  clear           - Clear terminal output

Search commands:
  b <query>       - Search Brave for query
  g <query>       - Search Google for query
  y <query>       - Search YouTube for query
  r <query>       - Search Reddit for query

Note: Use Tab for autocomplete and cycling through bookmark options`;

    this.showOutput(helpText, "info");
  }

  clearOutput() {
    document.getElementById("output").innerHTML = "";
  }

  showOutput(text, type = "info") {
    const output = document.getElementById("output");
    const div = document.createElement("div");
    div.className = `output ${type}`;
    div.textContent = text;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }

  showPreviousCommand() {
    this.removeAutocompletePreview();
    this.completionIndex = -1;
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const command = this.commandHistory[this.historyIndex];
      document.getElementById("commandInput").value = command;
      this.updateAutocomplete(command);
    }
  }

  showNextCommand() {
    this.removeAutocompletePreview();
    this.completionIndex = -1;
    if (this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex++;
      const command = this.commandHistory[this.historyIndex];
      document.getElementById("commandInput").value = command;
      this.updateAutocomplete(command);
    } else {
      this.historyIndex = this.commandHistory.length;
      document.getElementById("commandInput").value = "";
    }
  }

  saveToStorage() {
    localStorage.setItem(
      "hacker-startpage-bookmarks",
      JSON.stringify(this.bookmarks),
    );
  }

  loadFromStorage() {
    const stored = localStorage.getItem("hacker-startpage-bookmarks");
    if (stored) {
      this.bookmarks = JSON.parse(stored);
      this.renderBookmarksAsLS();
      document.getElementById("importSection").style.display = "none";
    }
  }
}

// Initialize the hacker startpage
document.addEventListener("DOMContentLoaded", () => {
  new HackerStartpage();
});
