export class UIManager {
  constructor() {
    this.elements = this.getElements();
  }

  getElements() {
    return {
      commandInput: document.getElementById("commandInput"),
      output: document.getElementById("output"),
      bookmarkList: document.getElementById("bookmarkList"),
      fileInput: document.getElementById("bookmarkFile"),
    };
  }

  showWelcome() {
    this.elements.output.innerHTML = `<div class="output info">Type 'help' for available commands</div>`;
  }

  showOutput(text, type = "info") {
    const div = document.createElement("div");
    div.className = `output ${type}`;

    if (type === "system-info") {
      div.innerHTML = text;
    } else {
      div.textContent = text;
    }

    this.elements.output.appendChild(div);
    this.elements.output.scrollTop = this.elements.output.scrollHeight;
  }

  clearOutput() {
    this.elements.output.innerHTML = "";
  }

  clearInput() {
    this.elements.commandInput.value = "";
  }

  focusInput() {
    const input = this.elements.commandInput;

    // Immediate focus
    input.focus();

    // Delayed focus backup
    setTimeout(() => input.focus(), 100);

    // Focus on click anywhere
    document.addEventListener("click", () => {
      if (document.activeElement !== input) {
        input.focus();
      }
    });

    // Focus on tab switch
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        input.focus();
      }
    });
  }

  renderBookmarks(bookmarks, onBookmarkClick) {
    const container = this.elements.bookmarkList;

    if (bookmarks.length === 0) {
      container.innerHTML =
        '<div class="no-bookmarks">No bookmarks found. Import bookmarks to get started.</div>';
      return;
    }

    const sortedBookmarks = [...bookmarks].sort((a, b) =>
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
        onBookmarkClick(url);
      });
    });
  }
}
