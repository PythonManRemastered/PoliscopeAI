chrome.runtime.onInstalled.addListener(() => {
  console.log("T&C Summarizer Extension Installed!");
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.storage.sync.get(["isEnabled"], (data) => {
      if (data.isEnabled) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"]
        });
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

      chrome.action.setBadgeText({ text: "" }); } });
