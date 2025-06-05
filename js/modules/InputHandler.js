import { AutocompleteHandler } from "./AutocompleteHandler.js";

export class InputHandler {
  constructor(state, ui, commandProcessor) {
    this.state = state;
    this.ui = ui;
    this.commandProcessor = commandProcessor;
    this.autocomplete = new AutocompleteHandler(state, ui);
  }

  setupEventListeners() {
    const input = this.ui.elements.commandInput;

    input.addEventListener("input", (e) => this.handleInput(e));
    input.addEventListener("keydown", (e) => this.handleKeydown(e));

    this.ui.elements.fileInput.addEventListener("change", (e) =>
      this.handleFileUpload(e),
    );
    document.addEventListener("keydown", (e) => this.handleGlobalKeydown(e));
  }

  handleInput(event) {
    this.autocomplete.update(event.target.value);
    this.state.autocomplete.completionIndex = -1;
  }

  async handleKeydown(event) {
    const keyHandlers = {
      Enter: () => this.commandProcessor.executeCommand(event.target.value),
      Tab: () => this.autocomplete.handleTabCompletion(),
      ArrowUp: () => this.showPreviousCommand(),
      ArrowDown: () => this.showNextCommand(),
      Escape: () => this.autocomplete.clear(),
    };

    if (keyHandlers[event.key]) {
      event.preventDefault();
      await keyHandlers[event.key]();
    } else {
      setTimeout(() => this.autocomplete.update(event.target.value), 0);
    }
  }

  handleGlobalKeydown(event) {
    if (document.activeElement === this.ui.elements.commandInput) return;

    if (event.key === "d") {
      const currentTime = Date.now();
      if (
        this.state.keyState.lastKeyPress === "d" &&
        currentTime - this.state.keyState.lastKeyTime < 300
      ) {
        event.preventDefault();
        this.ui.clearInput();
        this.autocomplete.clear();
        this.ui.clearOutput();
        this.ui.showOutput("Input cleared (dd)", "info");
        this.ui.focusInput();
        this.state.clearKeyState();
        return;
      }
      this.state.updateKeyState("d");
    } else {
      this.state.clearKeyState();
    }
  }

  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await this.commandProcessor.bookmarkManager.importFromFile(file);
      event.target.value = "";
    } catch (error) {
      console.error("File upload failed:", error);
    }
  }

  showPreviousCommand() {
    this.autocomplete.clear();
    if (this.state.historyIndex > 0) {
      this.state.historyIndex--;
      const command = this.state.commandHistory[this.state.historyIndex];
      this.ui.elements.commandInput.value = command;
      this.autocomplete.update(command);
    }
  }

  showNextCommand() {
    this.autocomplete.clear();
    if (this.state.historyIndex < this.state.commandHistory.length - 1) {
      this.state.historyIndex++;
      const command = this.state.commandHistory[this.state.historyIndex];
      this.ui.elements.commandInput.value = command;
      this.autocomplete.update(command);
    } else {
      this.state.historyIndex = this.state.commandHistory.length;
      this.ui.elements.commandInput.value = "";
    }
  }
}
