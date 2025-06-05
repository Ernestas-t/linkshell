export class Utils {
  static isURL(input) {
    const urlPattern = /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/;
    return urlPattern.test(input.trim());
  }

  static normalizeURL(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
    return url;
  }

  static isSearchCommand(input) {
    const searchPattern = /^[bgyr]\s+.+/;
    return searchPattern.test(input.trim());
  }

  static findCommonPrefix(strings) {
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

  static getTextWidth(text, element) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const style = window.getComputedStyle(element);
    context.font = style.font;
    return context.measureText(text).width;
  }
}
