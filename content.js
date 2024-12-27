// link checking mech.


(async function() {
  console.log("Content script loaded and scanning the page...");
  // Check for Terms and Conditions links
  const links = Array.from(document.querySelectorAll("a"))
    .filter(link => /terms|conditions|privacy|agreement|policy/i.test(link.textContent))
    .map(link => link.href);

  if (links.length > 0) {
    console.log("Terms & Conditions link(s) found:", links);
    chrome.runtime.sendMessage({ action: "updateBadge", count: links.length });

    // Fetch and summarize the first T&C link
    try {
      const response = await fetch(links[0]);
      const html = await response.text();

      // Extract plain text from the HTML
      const plainText = extractTermsOfService(html);
      if (plainText != "No Terms of Service content found."){

        // Send the plain text to your summarization API
        const summary = await responseGive(plainText);
        chrome.browserAction.setBadgeText({text: 'grr' });

        // Display the summary in the console or notify the user


        alert(summary)
        console.log(summary);

      }


    } catch (error) {
      // alert("Error fetching or summarizing Terms & Conditions:") // popup message
      
      console.error("Error fetching or summarizing Terms & Conditions:", error);
    }
  } else {
    // alert("No Terms & Conditions link found on this page.")
    console.log("No Terms & Conditions link found on this page.");
    chrome.runtime.sendMessage({ action: "clearBadge" });
    
  }

  async function extractTermsOfService(html) {
    const parser = new DOMParser(); // 
    const doc = parser.parseFromString(html, "text/html");
  
    // Keywords to identify relevant sections
    const keywords = /(terms|conditions|privacy|agreement|policy|use|legal|service)/i;
  
    // Identify the main container likely holding the T&C
    const candidates = Array.from(doc.body.querySelectorAll("div, section, article, p, span"))
      .filter((element) => {
        const text = element.textContent.trim();
        return keywords.test(text) && text.length > 100; // Must contain keywords and have substantial content
      });
  
    // Sort candidates by the length of text (longest content is most likely the T&C section)
    const sortedCandidates = candidates.sort((a, b) => b.textContent.length - a.textContent.length);
  
    // Extract the most likely T&C content
    const termsElement = sortedCandidates[0];
  
    if (termsElement) {
      // Format the text while preserving meaningful line breaks
      const textContent = formatText(termsElement.textContent.trim());
      return textContent;
    } else {

      return "No Terms of Service content found.";
    }
  
    // Helper function to format text
    function formatText(text) {
      return text
        .split("\n") // Split lines
        .map((line) => line.trim()) // Trim each line
        .filter((line) => line.length > 0) // Remove empty lines
        .join("\n\n"); // Add double newlines for better readability
    }
  }

  
  async function responseGive(userSum) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const apiKey = "AIzaSyAkhNKwsWWG50-op0M1Gc_YE9h6SHXSs_M";

    const payload = {
      "system_instruction": {
        "parts": [{ "text": "Assess these terms of conditions and give a short summary of the key points." }]
      },
      "contents": {
        "parts": [{ "text": `${userSum}` }]
      }
    };

    try {
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      console.log(`Response Status Code: ${response.status}`);

      let resultText = "";

      if (response.ok) {
        const result = await response.json();
        console.log("Response JSON:");
        console.log(JSON.stringify(result, null, 2));

        if (
          result &&
          result.candidates &&
          result.candidates[0].content &&
          result.candidates[0].content.parts &&
          result.candidates[0].content.parts[0]
        ) {
          resultText = result.candidates[0].content.parts[0].text;
          console.log(`Extracted Text: ${resultText}`);
        }
      } else {
        console.error(`Error: ${response.status}`);
        console.error(`Response Text: ${await response.text()}`);
      }

      return resultText;

    } catch (error) {
      console.error("Error during API call:", error);
      return "";
    }
}

})();
  