class HackerStartpage {
  constructor() {
    this.bookmarks = [];
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentCompletion = null;
    this.possibleCompletions = [];
    this.completionIndex = -1;
    this.lastKeyPress = null;
    this.lastKeyTime = 0;
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

    // Global keydown listener for dd when input is not focused
    document.addEventListener("keydown", (e) => this.handleGlobalKeydown(e));

    // Load bookmarks from localStorage
    this.loadFromStorage();

    // Show welcome message
    this.showWelcome();

    // Multiple attempts to focus the input
    this.focusInput();
  }

  focusInput() {
    const commandInput = document.getElementById("commandInput");

    // Immediate focus
    commandInput.focus();

    // Delayed focus (in case immediate doesn't work)
    setTimeout(() => {
      commandInput.focus();
    }, 100);

    // Focus on any click anywhere on the page
    document.addEventListener("click", () => {
      if (document.activeElement !== commandInput) {
        commandInput.focus();
      }
    });

    // Focus when page becomes visible (tab switching)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        commandInput.focus();
      }
    });
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

  handleGlobalKeydown(event) {
    const commandInput = document.getElementById("commandInput");
    const currentTime = Date.now();

    // Only handle global shortcuts when input is NOT focused
    if (document.activeElement === commandInput) {
      return; // Input is focused, don't interfere
    }

    // Handle double-press 'd' to clear input globally
    if (event.key === "d") {
      if (this.lastKeyPress === "d" && currentTime - this.lastKeyTime < 300) {
        // Double 'd' pressed within 300ms
        event.preventDefault();
        commandInput.value = "";
        this.removeAutocompletePreview();

        // Clear previous output first, then show the dd message
        this.clearOutput();
        this.showOutput("Input cleared (dd)", "info");

        this.lastKeyPress = null;
        // Focus the input after clearing
        commandInput.focus();
        return;
      }
      this.lastKeyPress = "d";
      this.lastKeyTime = currentTime;
    } else {
      this.lastKeyPress = null;
    }
  }

  handleKeydown(event) {
    const input = event.target;

    // Remove the dd handling from here since it's now global
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
      case "export":
        this.handleExportCommand();
        break;
      case "neofetch":
      case "fastfetch":
      case "ff":
        this.handleSystemInfoCommand();
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

  handleExportCommand() {
    if (this.bookmarks.length === 0) {
      this.showOutput(
        "No bookmarks to export. Import some bookmarks first.",
        "error",
      );
      return;
    }

    // Create HTML export in Netscape bookmark format
    const html = this.generateBookmarkHTML();

    // Create blob and download
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Create temporary download link
    const link = document.createElement("a");
    link.href = url;
    link.download = `terminal-startpage-bookmarks-${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    this.showOutput(
      `Exported ${this.bookmarks.length} bookmarks to HTML file`,
      "success",
    );
  }

  generateBookmarkHTML() {
    const timestamp = Math.floor(Date.now() / 1000);

    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>

<DL><p>
    <DT><H3 ADD_DATE="${timestamp}" LAST_MODIFIED="${timestamp}">Terminal Startpage Bookmarks</H3>
    <DL><p>
`;

    // Add each bookmark
    this.bookmarks.forEach((bookmark) => {
      html += `        <DT><A HREF="${bookmark.url}" ADD_DATE="${timestamp}">${bookmark.title}</A>\n`;
    });

    html += `    </DL><p>
</DL><p>`;

    return html;
  }

  handleSystemInfoCommand() {
    const info = this.gatherSystemInfo();
    const asciiArt = this.getArchAscii();

    // Create a container for the neofetch-style output
    const output = document.getElementById("output");
    const systemDiv = document.createElement("div");
    systemDiv.className = "output system-info";

    // Split ASCII art and info into arrays for line-by-line processing
    const asciiLines = asciiArt.split("\n");
    const infoLines = info.split("\n");

    // Create the side-by-side layout
    let combinedOutput = "";
    const maxLines = Math.max(asciiLines.length, infoLines.length);

    for (let i = 0; i < maxLines; i++) {
      const asciiLine = asciiLines[i] || "";
      const infoLine = infoLines[i] || "";

      // Pad ASCII line to consistent width (41 characters)
      const paddedAscii = asciiLine.padEnd(41);
      combinedOutput += paddedAscii + infoLine + "\n";
    }

    systemDiv.innerHTML = `<pre>${combinedOutput}</pre>`;
    output.appendChild(systemDiv);
  }

  gatherSystemInfo() {
    const nav = navigator;
    const screen = window.screen;
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;

    // Get browser info
    const browserInfo = this.getBrowserInfo();

    // Calculate uptime (time since page load)
    const uptimeMs = Date.now() - performance.timeOrigin;
    const uptime = this.formatUptime(uptimeMs);

    // Get memory info if available
    const memory = nav.deviceMemory ? `${nav.deviceMemory} GB` : "Unknown";

    // Get screen resolution
    const resolution = `${screen.width}x${screen.height}`;

    // Get timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get language
    const language = nav.language || nav.languages[0];

    // Get connection info
    const connectionType = connection ? connection.effectiveType : "Unknown";

    // Get bookmark count
    const bookmarkCount = this.bookmarks.length;

    // Format the info section (each line will be aligned with ASCII)
    return `<span class="neofetch-header">arch@zen-browser</span>
<span class="neofetch-separator">-----------------------</span>
<span class="neofetch-label">OS:</span> <span class="neofetch-value">${nav.platform}</span>
<span class="neofetch-label">Browser:</span> <span class="neofetch-value">${browserInfo.name} ${browserInfo.version}</span>
<span class="neofetch-label">Engine:</span> <span class="neofetch-value">${browserInfo.engine}</span>
<span class="neofetch-label">Resolution:</span> <span class="neofetch-value">${resolution}</span>
<span class="neofetch-label">Memory:</span> <span class="neofetch-value">${memory}</span>
<span class="neofetch-label">Uptime:</span> <span class="neofetch-value">${uptime}</span>
<span class="neofetch-label">Language:</span> <span class="neofetch-value">${language}</span>
<span class="neofetch-label">Timezone:</span> <span class="neofetch-value">${timezone}</span>
<span class="neofetch-label">Connection:</span> <span class="neofetch-value">${connectionType}</span>
<span class="neofetch-label">Bookmarks:</span> <span class="neofetch-value">${bookmarkCount}</span>
<span class="neofetch-label">Storage:</span> <span class="neofetch-value">localStorage</span>
<span class="neofetch-label">URL:</span> <span class="neofetch-value">${window.location.hostname || "localhost"}</span>
<span class="neofetch-label">Cookies:</span> <span class="neofetch-value">${nav.cookieEnabled ? "Enabled" : "Disabled"}</span>
<span class="neofetch-label">Java:</span> <span class="neofetch-value">${nav.javaEnabled ? nav.javaEnabled() : "Disabled"}</span>`;
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = { name: "Unknown", version: "Unknown", engine: "Unknown" };

    if (ua.includes("Firefox")) {
      browser.name = "Firefox";
      browser.engine = "Gecko";
      const version = ua.match(/Firefox\/(\d+\.\d+)/);
      browser.version = version ? version[1] : "Unknown";
    } else if (ua.includes("Chrome")) {
      browser.name = ua.includes("Edg") ? "Edge" : "Chrome";
      browser.engine = "Blink";
      const version = ua.match(/Chrome\/(\d+\.\d+)/);
      browser.version = version ? version[1] : "Unknown";
    } else if (ua.includes("Safari")) {
      browser.name = "Safari";
      browser.engine = "WebKit";
      const version = ua.match(/Version\/(\d+\.\d+)/);
      browser.version = version ? version[1] : "Unknown";
    }

    return browser;
  }

  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""}, ${hours % 24} hour${hours % 24 !== 1 ? "s" : ""}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}, ${minutes % 60} min${minutes % 60 !== 1 ? "s" : ""}`;
    } else if (minutes > 0) {
      return `${minutes} min${minutes > 1 ? "s" : ""}, ${seconds % 60} sec${seconds % 60 !== 1 ? "s" : ""}`;
    } else {
      return `${seconds} sec${seconds !== 1 ? "s" : ""}`;
    }
  }

  getArchAscii() {
    return `<span class="arch-logo">                  -\`                     
                 .o+\`                    
                \`ooo/                    
               \`+oooo:                   
              \`+oooooo:                  
              -+oooooo+:                 
            \`/:-:++oooo+:                
           \`/++++/+++++++:               
          \`/++++++++++++++:              
         \`/+++ooooooooooooo/\`            
        ./ooosssso++osssssso+\`           
       .oossssso-\`\`\`\`/ossssss+\`          
      -osssssso.      :ssssssso.         
     :osssssss/        osssso+++.        
    /ossssssss/        +ssssooo/-        
  \`/ossssso+/:-        -:/+osssso+-      
 \`+sso+:-\`                 \`.-/+oso:     
\`++:.                           \`-/+/    
.\`                                 \`/</span>    
                                         `;
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
