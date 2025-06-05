import { AppState } from "./AppState.js";
import { UIManager } from "./UIManager.js";
import { BookmarkManager } from "../modules/BookmarkManager.js";
import { CommandProcessor } from "../modules/CommandProcessor.js";
import { InputHandler } from "../modules/InputHandler.js";

export class HackerStartpage {
  constructor() {
    this.state = new AppState();
    this.ui = new UIManager();
    this.bookmarkManager = new BookmarkManager(this.state, this.ui);
    this.commandProcessor = new CommandProcessor(
      this.state,
      this.ui,
      this.bookmarkManager,
    );
    this.inputHandler = new InputHandler(
      this.state,
      this.ui,
      this.commandProcessor,
    );

    this.init();
  }

  async init() {
    try {
      await this.bookmarkManager.loadFromStorage();
      this.ui.showWelcome();
      this.inputHandler.setupEventListeners();
      this.ui.focusInput();
    } catch (error) {
      console.error("Failed to initialize application:", error);
      this.ui.showOutput("Failed to initialize application", "error");
    }
  }
}
