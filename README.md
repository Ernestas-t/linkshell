# Linkshell Startpage

A sleek, terminal-inspired browser startpage for managing bookmarks with a hacker aesthetic. Features zsh-style autocomplete, search functionality, and a beautiful Gruvbox color scheme.

![Terminal Startpage Demo](https://via.placeholder.com/800x500/282828/ebdbb2?text=Terminal+Startpage)

## ✨ Features

### 🔍 Smart Navigation

- **Bookmark Management**: Import HTML bookmark files from any browser
- **URL Support**: Direct URL navigation (e.g., `netflix.com`, `https://github.com`)
- **Intelligent Autocomplete**: zsh-style tab completion with common prefix detection
- **Command History**: Navigate through previous commands with arrow keys

### 🔎 Search Integration

- **Brave Search**: `b <query>` - Search with Brave
- **Google Search**: `g <query>` - Search with Google
- **YouTube Search**: `y <query>` - Search YouTube
- **Reddit Search**: `r <query>` - Search Reddit

### 🎨 Terminal Aesthetics

- **Gruvbox Theme**: Dark, eye-friendly color scheme
- **Transparency Effects**: See-through background like a real terminal
- **JetBrains Mono Font**: Clean, monospace typography
- **Responsive Design**: Works on desktop and mobile

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open `index.html`** in your browser
3. **Import bookmarks** using the file upload interface
4. **Start typing** bookmark names or URLs to navigate

## 💻 Usage

### Basic Commands

```bash
# Open bookmarks by name
github
reddit
youtube

# Open URLs directly
netflix.com
https://delfi.lt

# Search engines
g javascript tutorial
y best music 2024
b privacy tools
r programming advice

# Utility commands
help          # Show all commands
clear         # Clear terminal output
import        # Import bookmark file
```

### Keyboard Shortcuts

- **Tab** - Autocomplete bookmark names / cycle through options
- **Enter** - Execute command
- **↑/↓** - Navigate command history
- **Escape** - Clear autocomplete

### Bookmark Import

1. Export bookmarks from your browser as HTML
2. Type `import` or click the import section
3. Select your HTML bookmark file
4. Bookmarks are automatically parsed and saved

## 🛠 Installation & Hosting

### Local Usage

```bash
git clone https://github.com/yourusername/terminal-startpage.git
cd terminal-startpage
# Open index.html in your browser
```

### GitHub Pages

1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Access at `https://yourusername.github.io/terminal-startpage`

### Set as Browser Homepage

1. Host the page (GitHub Pages, Netlify, etc.)
2. Set the URL as your browser's homepage
3. Optional: Set as new tab page using browser extensions

## 🎯 Examples

```bash
# Quick bookmark access
arch@zen-browser:~$ github
Opening: GitHub

# URL navigation
arch@zen-browser:~$ netflix.com
Opening URL: https://netflix.com

# Smart search
arch@zen-browser:~$ g how to code
Searching Google for: "how to code"

# Autocomplete (type 'gith' + Tab)
arch@zen-browser:~$ github_repo_name
```

## 📁 Project Structure

```
terminal-startpage/
├── index.html          # Main HTML structure
├── styles.css          # Gruvbox theme + transparency
├── script.js           # Terminal logic & bookmark management
└── README.md          # This file
```

## 🔧 Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
  --bg0: #282828; /* Background */
  --fg1: #ebdbb2; /* Text */
  --green: #b8bb26; /* User/success */
  --blue: #83a598; /* Path/info */
  /* ... */
}
```

### Search Providers

Add new search engines in `script.js`:

```javascript
this.searchProviders = {
  duckduckgo: {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
  },
};
```

### Transparency

Adjust opacity in `styles.css`:

```css
.terminal {
  background-color: rgba(40, 40, 40, 0.8); /* 0.8 = 80% opacity */
}
```

## 💾 Data Storage

- **Local Storage**: Bookmarks saved in browser localStorage
- **Persistent**: Data survives browser restarts and updates
- **Private**: Each user manages their own bookmarks
- **Cross-Browser**: Import once per browser/device

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- **Gruvbox** color scheme by [morhetz](https://github.com/morhetz/gruvbox)
- **JetBrains Mono** font by JetBrains
- Inspired by terminal emulators and hacker culture

---

⭐ **Star this repo** if you find it useful!
