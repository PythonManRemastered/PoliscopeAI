(async function () {
  console.log("Content script loaded and scanning the page...");

  const links = Array.from(document.querySelectorAll("a"))
    .filter((link) =>
      /cookie|terms|conditions|privacy|agreement|policy/i.test(link.textContent)
    )
    .map((link) => link.href);

  if (links.length > 0) {
    console.log("Links found:", links);
    chrome.runtime.sendMessage({ action: "updateBadge", count: links.length });

    try {
      const summaries = await Promise.all(
        links.map(async (link, index) => {
          try {
            return await processLink(link, index);
          } catch (error) {
            console.error(`Error processing Link #${index + 1}:`, error);
            return `### Document #${index + 1}:\nSource: ${link}\n\nError: ${error.message}\n\n`;
          }
        })
      );

      console.log("All summaries completed:", summaries);
      // alert(`Summary of All Documents:\n\n${summaries.join("\n")}`);

      chrome.storage.sync.set({ "summaries":summaries }, () => {
        console.log("Summary saved to storage:", summaries);
      });

      // chrome.runtime.sendMessage({ action: "displaySummary", summary: summaries});

    } 
    
    catch (error) {
      console.error("Unexpected error during summary generation:", error);
      alert("Error generating summaries. Please check the console.");
    }
  } else {
    console.log("No Terms and Conditions link found on this page.");
    chrome.runtime.sendMessage({ action: "clearBadge" });
  }

  async function processLink(link, index) {
    console.log(`\n--- Processing Link #${index + 1} ---`);
    console.log(`Fetching document from: ${link}`);

    const response = await fetch(link);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status} - ${response.statusText}`);
    }

    const html = await response.text();
    const plainText = await extractTermsOfService(html);

    if (plainText === "No Terms of Service content found.") {
      console.warn(`No relevant content found for Link #${index + 1}.`);
      return `### Document #${index + 1}:\nSource: ${link}\n\nNo relevant content found.\n\n`;
    }

    console.log(`Plain text extracted for Link #${index + 1}. Sending to API for summarization...`);
    const summary = await responseGive(plainText, link, index + 1);

    if (!summary) {
      console.error(`No summary returned for Link #${index + 1}.`);
      return `### Document #${index + 1}:\nSource: ${link}\n\nError: Could not generate summary.\n\n`;
    }

    console.log(`Summary successfully generated for Link #${index + 1}.`);
    return `### Document #${index + 1}:\nSource: ${link}\n\n${summary}\n\n`;
  }

  async function extractTermsOfService(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const keywords = /(terms|conditions|privacy|agreement|policy|use|legal|service)/i;

    const candidates = Array.from(
      doc.body.querySelectorAll("div, section, article, p, span")
    ).filter((element) => {
      const text = element.textContent.trim();
      return keywords.test(text) && text.length > 100;
    });

    const termsElement = candidates.sort((a, b) => b.textContent.length - a.textContent.length)[0];

    return termsElement ? formatText(termsElement.textContent.trim()) : "No Terms of Service content found.";

    function formatText(text) {
      return text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n\n");
    }
  }

  async function responseGive(userSum, link, index) {
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const apiKey = "AIzaSyAkhNKwsWWG50-op0M1Gc_YE9h6SHXSs_M";

    const payload = {
      system_instruction: {
        parts: [
          {
            text: `
            Assess these legal arguements and terms and conditions using the following framework to a tee. Recheck your answer 5 times 
            prior to outputting an answer. The framework works on the following criteria: (1) Clauses (50-100 words): In bullet points, 
            describe the basic clauses of the terms and condition, privacy policy, or document agreement given. Ensure the text you provide
            is simplified, and that any and all legal-terms are replaced by easy-to-read English. If words which are intentionally misleading,
            such as 'may' or 'including' are written in the context of the document, or any ambigious statements are provided by the provider, 
            flag this to the user and tell them to read further themselves.
            prior to using the program. This section must not exceed 100 words. After this is done, format the text such that important sections are 
            bolded, all points are in bullet points and spaced well, and all warning are in a contrasting colour. Use insolata as the primary font. 
            Ensure the text returned is of 14 px font. (2) User obligation and any privacy concerns such as the distribution of data to third parties
            (50 words): Summarise the user's obligations to the website in the sense of what can and cannot be done. Spend more tokens on the use of 
            the user's data in the form of third-party distribution. If this is being done, flag it to the user. Same formatting guidelines as the 
            previous section. Remember, this text is all for an HTML/CSS/JS file, so all bolds and highlights and colours should be done
            accordingly. Ensure there are no astrixes shown to the user randomly, and all data is structured in bullet points ONLY. Note, the 
            entire summary should not be too long, make it as short as you can without comprimising on each and every clause shown to you.
            `,
          },

        ],
      },
      contents: {
        parts: [{ text: userSum }],
      },
    };

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),

    });


    if (response.ok) {
      const result = await response.json();
      const content = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      return content || "No valid summary returned.";
    } else {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`API Error: ${response.statusText}`);
    }
  }
})();


