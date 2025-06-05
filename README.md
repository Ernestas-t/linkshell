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
- **CaskaydiaCove Nerd Font**: Clean, monospace typography with icon support
- **Responsive Design**: Works on desktop and mobile
- **System Info**: Built-in neofetch-style system information display

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Serve from web server** (required for ES6 modules):
   ```bash
   python3 -m http.server 8000
   # Then open http://localhost:8000
   ```
3. **Import bookmarks** using the `import` command
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
https://youtube.com

# Search engines
g javascript tutorial
y best music 2024
b privacy tools
r programming advice

# Utility commands
help          # Show all commands
clear         # Clear terminal output
import        # Import bookmark file
export        # Export bookmarks to HTML
neofetch      # Show system information
ff            # Alias for neofetch
```

### Keyboard Shortcuts

- **Tab** - Autocomplete bookmark names / cycle through options
- **Enter** - Execute command
- **↑/↓** - Navigate command history
- **Escape** - Clear autocomplete
- **dd** - Clear input (double-tap 'd' when input not focused)

### Bookmark Import

1. Export bookmarks from your browser as HTML
2. Type `import` command
3. Select your HTML bookmark file from the dialog
4. Bookmarks are automatically parsed and saved to localStorage

## 🛠 Installation & Hosting

### Local Development

```bash
git clone https://github.com/yourusername/linkshell-startpage.git
cd linkshell-startpage

# Serve with Python (recommended)
python3 -m http.server 8000

# Or with Node.js
npx http-server

# Then open http://localhost:8000
```

**Important**: Due to ES6 module usage, you must serve from a web server. Opening `index.html` directly (`file://`) won't work due to CORS restrictions.

### GitHub Pages

1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Access at `https://yourusername.github.io/linkshell-startpage`

### Set as Browser Homepage

1. Host the page (GitHub Pages, Netlify, Vercel, etc.)
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

# System information
arch@zen-browser:~$ neofetch
# Shows ASCII art + system info

# Autocomplete (type 'gith' + Tab)
arch@zen-browser:~$ github_repo_name
```

## 📁 Project Structure

```
linkshell-startpage/
├── index.html              # Main HTML structure
├── styles.css              # Gruvbox theme styling
├── js/
│   ├── main.js             # Application entry point
│   ├── core/
│   │   ├── AppState.js     # State management
│   │   ├── HackerStartpage.js  # Main application class
│   │   └── UIManager.js    # DOM manipulation
│   ├── modules/
│   │   ├── AutocompleteHandler.js  # Tab completion logic
│   │   ├── BookmarkManager.js      # Bookmark operations
│   │   ├── CommandProcessor.js     # Command routing
│   │   ├── InputHandler.js         # Keyboard/input handling
│   │   └── SystemInfo.js           # System information display
│   └── utils/
│       ├── SearchProviders.js      # Search engine configs
│       └── Utils.js                # Utility functions
└── README.md               # This file
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
  --red: #fb4934; /* Errors */
  --yellow: #fabd2f; /* Labels */
  /* ... */
}
```

### Search Providers

Add new search engines in `js/utils/SearchProviders.js`:

```javascript
this.providers = {
  d: {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
  },
  // Add more providers...
};
```

### Commands

Extend functionality by modifying `js/modules/CommandProcessor.js`:

```javascript
async routeCommand(cmd, parts) {
  const commands = {
    'your-command': () => this.yourCustomFunction(),
    // Add custom commands...
  };
}
```

## 💾 Data Storage

- **Local Storage**: Bookmarks saved in browser localStorage
- **Persistent**: Data survives browser restarts and updates
- **Private**: Each user manages their own bookmarks locally
- **Cross-Browser**: Import once per browser/device
- **Export/Import**: Full backup and restore capability

## 🚨 Browser Requirements

- **ES6 Modules**: Modern browser with ES6 module support
- **LocalStorage**: For bookmark persistence
- **File API**: For bookmark import/export
- **Web Server**: Cannot run from `file://` protocol

Tested on: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the modular structure
4. Test thoroughly with a local web server
5. Submit a pull request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/linkshell-startpage.git
cd linkshell-startpage

# Start development server
python3 -m http.server 8000

# Make changes to js/ files
# Test at http://localhost:8000
```

## 📄 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- **Gruvbox** color scheme by [morhetz](https://github.com/morhetz/gruvbox)
- **CaskaydiaCove Nerd Font** for beautiful monospace typography
- **ES6 Modules** for clean, maintainable code architecture
- Inspired by terminal emulators and hacker culture

---

⭐ **Star this repo** if you find it useful!
