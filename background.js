chrome.runtime.onInstalled.addListener(() => {
  console.log("T&C Summarizer Extension Installed!");
});



chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    chrome.storage.sync.clear(() => {
      console.log("Storage cleared for new tab.");
      chrome.action.setBadgeText({ text: "" }); 
      
      const excludedDomains = ["google.com"];
      const url = new URL(tab.url);

      if (!excludedDomains.some(domain => url.hostname.includes(domain))) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"]
        });
      } else {
        console.log('Script not injected for: ${url.hostname}');
      }
    });
  }
});

// Example notification function
function notifyUser(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: title,
    message: message
  });
}
// error fix

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "displaySummary") {
    // Optionally log the summary in the background script
    console.log("Summary received:", message.summary);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => { 
  if (message.action === "updateBadge") {
    console.log("Adding works");
    // Set the badge text and color 

      chrome.action.setBadgeText({ text: message.count.toString() }); 
      chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });  // Red background

 } else if (message.action === "clearBadge") {
      console.log("Clearing works");

      chrome.action.setBadgeText({ text: "" }); 
    }
   });
