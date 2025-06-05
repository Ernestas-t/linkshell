export class SystemInfo {
  constructor(state) {
    this.state = state;
  }

  display(ui) {
    const info = this.gatherSystemInfo();
    const asciiArt = this.getArchAscii();

    // Split ASCII art and info into arrays for line-by-line processing
    const asciiLines = asciiArt.split("\n");
    const infoLines = info.split("\n");

    // Create the side-by-side layout
    let combinedOutput = "";
    const maxLines = Math.max(asciiLines.length, infoLines.length);

    for (let i = 0; i < maxLines; i++) {
      const asciiLine = asciiLines[i] || "";
      const infoLine = infoLines[i] || "";

      // Pad ASCII line to consistent width (41 characters)
      const paddedAscii = asciiLine.padEnd(41);
      combinedOutput += paddedAscii + infoLine + "\n";
    }

    ui.showOutput(`<pre>${combinedOutput}</pre>`, "system-info");
  }

  gatherSystemInfo() {
    const nav = navigator;
    const screen = window.screen;

    // Get browser info
    const browserInfo = this.getBrowserInfo();

    // Calculate uptime (time since page load)
    const uptimeMs = Date.now() - performance.timeOrigin;
    const uptime = this.formatUptime(uptimeMs);

    // Get screen resolution
    const resolution = `${screen.width}x${screen.height}`;
    const colorDepth = `${screen.colorDepth}-bit`;

    // Get timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get language
    const language = nav.language || nav.languages[0];

    // Get online status and connection estimation
    const networkInfo = this.getNetworkInfo();

    // Get bookmark count
    const bookmarkCount = this.state.bookmarks.length;

    // Get CPU cores
    const cores = nav.hardwareConcurrency || "Unknown";

    // Format the info section (each line will be aligned with ASCII)
    return `<span class="neofetch-header">user@terminal-startpage</span>
<span class="neofetch-separator">-----------------------</span>
<span class="neofetch-label">OS:</span> <span class="neofetch-value">${nav.platform}</span>
<span class="neofetch-label">Browser:</span> <span class="neofetch-value">${browserInfo.name} ${browserInfo.version}</span>
<span class="neofetch-label">Engine:</span> <span class="neofetch-value">${browserInfo.engine}</span>
<span class="neofetch-label">Resolution:</span> <span class="neofetch-value">${resolution} (${colorDepth})</span>
<span class="neofetch-label">CPU Cores:</span> <span class="neofetch-value">${cores}</span>
<span class="neofetch-label">Uptime:</span> <span class="neofetch-value">${uptime}</span>
<span class="neofetch-label">Language:</span> <span class="neofetch-value">${language}</span>
<span class="neofetch-label">Timezone:</span> <span class="neofetch-value">${timezone}</span>
<span class="neofetch-label">Network:</span> <span class="neofetch-value">${networkInfo}</span>
<span class="neofetch-label">Bookmarks:</span> <span class="neofetch-value">${bookmarkCount}</span>
<span class="neofetch-label">Storage:</span> <span class="neofetch-value">localStorage</span>
<span class="neofetch-label">URL:</span> <span class="neofetch-value">${window.location.hostname || "localhost"}</span>
<span class="neofetch-label">Cookies:</span> <span class="neofetch-value">${nav.cookieEnabled ? "Enabled" : "Disabled"}</span>`;
  }

  getNetworkInfo() {
    const nav = navigator;

    // Try Network Information API first (Chrome/Edge)
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;
    if (connection && connection.effectiveType) {
      const type = connection.effectiveType;
      const downlink = connection.downlink
        ? ` (${connection.downlink} Mbps)`
        : "";
      return `${type.toUpperCase()}${downlink}`;
    }

    // Fallback: Online status + calculated speed metrics
    const online = nav.onLine ? "Online" : "Offline";

    if (nav.onLine && performance.timing) {
      const timing = performance.timing;

      // Calculate various speed metrics
      const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
      const connectTime = timing.connectEnd - timing.connectStart;
      const responseTime = timing.responseEnd - timing.responseStart;
      const loadTime = timing.loadEventEnd - timing.navigationStart;

      // Estimate download speed based on page load
      if (loadTime > 0 && responseTime > 0) {
        const estimatedPageSize = 500; // KB
        const downloadTimeSeconds = responseTime / 1000;
        const estimatedSpeed = Math.round(
          ((estimatedPageSize / downloadTimeSeconds) * 8) / 1024,
        );

        // Add latency info
        const totalLatency = dnsTime + connectTime;

        if (estimatedSpeed > 0 && totalLatency >= 0) {
          return `${online} (~${estimatedSpeed} Mbps, ${totalLatency}ms latency)`;
        } else if (totalLatency >= 0) {
          return `${online} (${totalLatency}ms latency)`;
        }
      }

      // Fallback to just load time
      if (loadTime > 0) {
        return `${online} (${loadTime}ms load time)`;
      }
    }

    return online;
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = { name: "Unknown", version: "Unknown", engine: "Unknown" };

    if (ua.includes("Firefox")) {
      browser.name = "Firefox";
      browser.engine = "Gecko";
      const version = ua.match(/Firefox\/(\d+\.\d+)/);
      browser.version = version ? version[1] : "Unknown";
    } else if (ua.includes("Chrome")) {
      browser.name = ua.includes("Edg") ? "Edge" : "Chrome";
      browser.engine = "Blink";
      const version = ua.match(/Chrome\/(\d+\.\d+)/);
      browser.version = version ? version[1] : "Unknown";
    } else if (ua.includes("Safari")) {
      browser.name = "Safari";
      browser.engine = "WebKit";
      const version = ua.match(/Version\/(\d+\.\d+)/);
      browser.version = version ? version[1] : "Unknown";
    }

    return browser;
  }

  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""}, ${hours % 24} hour${hours % 24 !== 1 ? "s" : ""}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}, ${minutes % 60} min${minutes % 60 !== 1 ? "s" : ""}`;
    } else if (minutes > 0) {
      return `${minutes} min${minutes > 1 ? "s" : ""}, ${seconds % 60} sec${seconds % 60 !== 1 ? "s" : ""}`;
    } else {
      return `${seconds} sec${seconds !== 1 ? "s" : ""}`;
    }
  }

  getArchAscii() {
    return `<span class="arch-logo">                  -\`                     
                 .o+\`                    
                \`ooo/                    
               \`+oooo:                   
              \`+oooooo:                  
              -+oooooo+:                 
            \`/:-:++oooo+:                
           \`/++++/+++++++:               
          \`/++++++++++++++:              
         \`/+++ooooooooooooo/\`            
        ./ooosssso++osssssso+\`           
       .oossssso-\`\`\`\`/ossssss+\`          
      -osssssso.      :ssssssso.         
     :osssssss/        osssso+++.        
    /ossssssss/        +ssssooo/-        
  \`/ossssso+/:-        -:/+osssso+-      
 \`+sso+:-\`                 \`.-/+oso:     
\`++:.                           \`-/+/    
.\`                                 \`/</span>    
                                         `;
  }
}
