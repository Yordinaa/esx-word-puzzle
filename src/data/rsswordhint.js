import fs from "fs";
import fetch from "node-fetch";

const RSS_URL = "https://rss.app/feeds/v1.1/nedIB8HC06gPxwcU.json";

(async () => {
  console.log("🔍 Fetching feed...");
  const response = await fetch(RSS_URL);
  const data = await response.json();

  const items = data.items || [];
  const financeWords = [];

  const blacklist = [
    "the", "how", "what", "when", "why", "a", "an", "and", "of", "is", "in",
    "to", "for", "with", "on", "at", "by", "about", "from", "into", "as"
  ];

  for (const item of items) {
    if (!item.title) continue;

    // Extract a potential keyword from the title
    let cleanTitle = item.title
      .replace(/[^a-zA-Z\s]/g, "")
      .trim()
      .split(" ")[0]
      .toLowerCase();

    // Skip short/common words
    if (
      cleanTitle.length < 3 ||
      cleanTitle.length > 15 ||
      blacklist.includes(cleanTitle)
    ) {
      continue;
    }

    // Use the description or fallback hint
    const description = item.description
      ? item.description.replace(/\s+/g, " ").trim()
      : "A common finance or investing term.";

    financeWords.push({
      word: cleanTitle,
      hint: description,
    });
  }

  // Remove duplicates
  const uniqueWords = Array.from(
    new Map(financeWords.map((obj) => [obj.word, obj])).values()
  );

  console.log(`📚 Found ${uniqueWords.length} unique finance terms.`);

  fs.writeFileSync(
    "./rsswords.jsx",
    `export default ${JSON.stringify(uniqueWords, null, 2)};`
  );

  console.log(`🎉 Saved ${uniqueWords.length} clean single-word terms to rsswords.jsx`);
})();
