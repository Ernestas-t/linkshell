export class AppState {
  constructor() {
    this.bookmarks = [];
    this.commandHistory = [];
    this.historyIndex = -1;
    this.autocomplete = {
      currentCompletion: null,
      possibleCompletions: [],
      completionIndex: -1,
    };
    this.keyState = {
      lastKeyPress: null,
      lastKeyTime: 0,
    };
  }

  addToHistory(command) {
    this.commandHistory.push(command);
    this.historyIndex = this.commandHistory.length;
  }

  resetAutocomplete() {
    this.autocomplete.completionIndex = -1;
    this.autocomplete.currentCompletion = null;
    this.autocomplete.possibleCompletions = [];
  }

  updateKeyState(key) {
    this.keyState.lastKeyPress = key;
    this.keyState.lastKeyTime = Date.now();
  }

  clearKeyState() {
    this.keyState.lastKeyPress = null;
  }
}
