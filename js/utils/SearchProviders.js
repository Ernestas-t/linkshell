export class SearchProviders {
  constructor() {
    this.providers = {
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
  }

  isSearchCommand(cmd) {
    return this.providers.hasOwnProperty(cmd);
  }

  getSearchURL(provider, searchTerm) {
    return this.providers[provider].url + encodeURIComponent(searchTerm);
  }

  getProviderName(provider) {
    return this.providers[provider].name;
  }
}
