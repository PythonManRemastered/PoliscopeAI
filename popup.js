const page = document.getElementById("page_value").innerText;
console.log(page);




  document.addEventListener("DOMContentLoaded", () => {
    if (page == "Dashboard"){
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

    

    document.getElementById("navigateButton").addEventListener("click", function() {
        window.location.href = "Extractions.html";
    });

    const summaryContainer = document.getElementById("output");
    
      // Listen for messages from the content script


      chrome.storage.sync.get("summaries", function (obj) {

        
        summaryContainer.innerHTML = obj.summaries;

    });

      // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      //   console.log("summary is showing up");
      //   if (message.action === "displaySummary") {
      //     console.log("if statement of summary works");
      //     summaryContainer.innerHTML = '<p>hello</p>';
      //   }
      // });

    document.getElementById("FAQ").addEventListener("click", function() {
      window.location.href = "FAQ.html";
   });
    }
      
    if (page == "Extraction"){
      document.getElementById("extract").addEventListener("click", async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });

    });
}






    
  });
  