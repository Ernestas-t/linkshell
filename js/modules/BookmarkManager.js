export class BookmarkManager {
  constructor(state, ui) {
    this.state = state;
    this.ui = ui;
    this.storageKey = "hacker-startpage-bookmarks";
  }

  async loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.state.bookmarks = JSON.parse(stored);
        this.ui.renderBookmarks(this.state.bookmarks, (url) =>
          this.openBookmark(url),
        );
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
      this.ui.showOutput("Failed to load bookmarks from storage", "error");
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.state.bookmarks),
      );
    } catch (error) {
      console.error("Failed to save bookmarks:", error);
      this.ui.showOutput("Failed to save bookmarks to storage", "error");
    }
  }

  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          this.parseBookmarksFromHTML(e.target.result);
          this.saveToStorage();
          this.ui.renderBookmarks(this.state.bookmarks, (url) =>
            this.openBookmark(url),
          );
          this.ui.showOutput(
            `Successfully imported ${this.state.bookmarks.length} bookmarks`,
            "success",
          );
          resolve();
        } catch (error) {
          this.ui.showOutput("Error: Invalid bookmark file format", "error");
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  parseBookmarksFromHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    this.state.bookmarks = [];

    const links = doc.querySelectorAll("a[href]");
    links.forEach((link) => {
      if (link.href && link.href.startsWith("http")) {
        this.state.bookmarks.push({
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

  findBookmark(query) {
    return this.state.bookmarks.find((b) => b.name === query.toLowerCase());
  }

  getMatchingBookmarks(query) {
    return this.state.bookmarks
      .filter((bookmark) => bookmark.name.startsWith(query.toLowerCase()))
      .map((bookmark) => bookmark.name)
      .sort();
  }

  openBookmark(url) {
    window.open(url, "_blank");
  }

  exportToHTML() {
    if (this.state.bookmarks.length === 0) {
      this.ui.showOutput(
        "No bookmarks to export. Import some bookmarks first.",
        "error",
      );
      return;
    }

    const html = this.generateBookmarkHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `terminal-startpage-bookmarks-${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.ui.showOutput(
      `Exported ${this.state.bookmarks.length} bookmarks to HTML file`,
      "success",
    );
  }

  generateBookmarkHTML() {
    const timestamp = Math.floor(Date.now() / 1000);

    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="${timestamp}" LAST_MODIFIED="${timestamp}">Terminal Startpage Bookmarks</H3>
    <DL><p>
`;

    this.state.bookmarks.forEach((bookmark) => {
      html += `        <DT><A HREF="${bookmark.url}" ADD_DATE="${timestamp}">${bookmark.title}</A>\n`;
    });

    html += `    </DL><p>
</DL><p>`;

    return html;
  }
}
