import { Utils } from "../utils/Utils.js";

export class AutocompleteHandler {
  constructor(state, ui) {
    this.state = state;
    this.ui = ui;
  }

  update(input) {
    this.removePreview();

    if (!input.trim()) {
      this.state.autocomplete.possibleCompletions = [];
      return;
    }

    // Don't show autocomplete for URLs or search commands
    if (Utils.isURL(input) || Utils.isSearchCommand(input)) {
      this.state.autocomplete.possibleCompletions = [];
      return;
    }

    // Find all matching bookmarks
    const query = input.toLowerCase();
    this.state.autocomplete.possibleCompletions = this.state.bookmarks
      .filter((bookmark) => bookmark.name.startsWith(query))
      .map((bookmark) => bookmark.name)
      .sort();

    if (this.state.autocomplete.possibleCompletions.length > 0) {
      // Find common prefix among all matches
      const commonPrefix = Utils.findCommonPrefix(
        this.state.autocomplete.possibleCompletions,
      );

      if (commonPrefix.length > input.length) {
        // Show the common prefix completion
        this.showPreview(input, commonPrefix);
        this.state.autocomplete.currentCompletion = commonPrefix;
      } else if (this.state.autocomplete.possibleCompletions.length === 1) {
        // Only one match, show it
        this.showPreview(input, this.state.autocomplete.possibleCompletions[0]);
        this.state.autocomplete.currentCompletion =
          this.state.autocomplete.possibleCompletions[0];
      }
    } else {
      this.state.autocomplete.currentCompletion = null;
    }
  }

  showPreview(typed, completion) {
    const promptLine = document.querySelector(".prompt-line:nth-child(3)");
    const commandInput = this.ui.elements.commandInput;

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

    // Add padding to account for the typed text width
    preview.style.paddingLeft =
      Utils.getTextWidth(typed, commandInput) - 8 + "px";

    promptLine.appendChild(preview);
  }

  removePreview() {
    const existing = document.querySelector(".autocomplete-preview");
    if (existing) {
      existing.remove();
    }
  }

  handleTabCompletion() {
    const input = this.ui.elements.commandInput;
    const currentValue = input.value;

    if (this.state.autocomplete.possibleCompletions.length === 0) {
      return; // No completions available
    }

    if (this.state.autocomplete.possibleCompletions.length === 1) {
      // Only one match, complete it fully
      input.value = this.state.autocomplete.possibleCompletions[0];
      this.removePreview();
      this.state.autocomplete.currentCompletion = null;
      this.state.autocomplete.completionIndex = -1;
      return;
    }

    // Multiple matches - cycle through them or complete to common prefix
    if (
      this.state.autocomplete.currentCompletion &&
      currentValue === this.state.autocomplete.currentCompletion
    ) {
      // User has already completed to common prefix, start cycling
      this.state.autocomplete.completionIndex =
        (this.state.autocomplete.completionIndex + 1) %
        this.state.autocomplete.possibleCompletions.length;
      input.value =
        this.state.autocomplete.possibleCompletions[
          this.state.autocomplete.completionIndex
        ];
      this.removePreview();
    } else if (this.state.autocomplete.currentCompletion) {
      // Complete to common prefix first
      input.value = this.state.autocomplete.currentCompletion;
      this.removePreview();
    }
  }

  clear() {
    this.removePreview();
    this.state.resetAutocomplete();
  }
}
