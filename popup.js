document.getElementById("extract").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggle");
  
    // Load the toggle state from storage
    chrome.storage.sync.get(["isEnabled"], (data) => {
      const isEnabled = data.isEnabled ?? true; // Default to enabled
      toggleButton.textContent = isEnabled ? "Disable" : "Enable";
    });
  
    // Toggle the state when the button is clicked
    toggleButton.addEventListener("click", () => {
      chrome.storage.sync.get(["isEnabled"], (data) => {
        const isEnabled = data.isEnabled ?? true;
        const newState = !isEnabled;
  
        // Update the button text
        toggleButton.textContent = newState ? "Disable" : "Enable";
  
        // Save the new state to storage
        chrome.storage.sync.set({ isEnabled: newState }, () => {
          console.log(`Extension is now ${newState ? "enabled" : "disabled"}`);
        });
      });
    });
  });
  