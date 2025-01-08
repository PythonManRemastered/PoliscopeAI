const page = document.getElementById("page_value").innerText;
console.log(page);

document.addEventListener("DOMContentLoaded", () => {
  if (page === "Dashboard") {
    const toggleButton = document.getElementById("toggle");

    // Load the toggle state from storage
    chrome.storage.sync.get(["isEnabled"], (data) => {
      const isEnabled = data.isEnabled ?? true; // Default to enabled
      toggleButton.textContent = isEnabled ? "Disable" : "Enable";
    });

    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    }

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

    document.getElementById("navigateButton").addEventListener("click", function () {
      window.location.href = "Extractions.html";
    });

    const dynamicSectionsContainer = document.getElementById("dynamicSections");

    // Load summaries and dynamically create collapsible sections
    chrome.storage.sync.get("summaries", function (obj) {
      const summaries = obj.summaries || [];
      const l = summaries.length;
      console.log(l);

      // Clear the dynamic sections container
      dynamicSectionsContainer.innerHTML = "";

      // Dynamically create collapsible sections
      for (let i = 0; i < l; i++) {
        // Create collapsible button
        const collapsible = document.createElement("button");
        collapsible.className = "collapsible";
        collapsible.textContent = `Summary ${i + 1}`;

        // Create content div
        const contentDiv = document.createElement("div");
        contentDiv.className = "content";
        contentDiv.innerHTML = `<p>${summaries[i]}</p>`; // Populate with summary content

        // Append to container
        dynamicSectionsContainer.appendChild(collapsible);
        dynamicSectionsContainer.appendChild(contentDiv);

        // Add collapsible functionality
        collapsible.addEventListener("click", function () {
          this.classList.toggle("active");
          if (contentDiv.style.maxHeight) {
            contentDiv.style.maxHeight = null;
          } else {
            contentDiv.style.maxHeight = contentDiv.scrollHeight + "px";
          }
        });
      }
    });

    document.getElementById("FAQ").addEventListener("click", function () {
      window.location.href = "FAQ.html";
    });
  }

  if (page === "Extraction") {
    document.getElementById("extract").addEventListener("click", async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    });
  }
});
