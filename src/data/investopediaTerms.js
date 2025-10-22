// import axios from "axios";
// import * as cheerio from "cheerio";
// import fs from "fs";

// const TOKEN = "700064318cf04ab1a9ac5d3e63fc79700b5f80cdf21";

// async function scrapeInvestopedia() {
//   const letters = "abcdefghijklmnopqrstuvwxyz".split("");
//   const allTerms = [];

//   for (const letter of letters) {
//     const targetUrl = `https://www.investopedia.com/terms/${letter}/`;
//     const scrapeUrl = `https://api.scrape.do/?token=${TOKEN}&url=${encodeURIComponent(targetUrl)}`;

//     console.log(`📘 Scraping ${targetUrl}...`);

//     try {
//       const { data } = await axios.get(scrapeUrl, { timeout: 20000 });
//       const $ = cheerio.load(data);

//       //console.log(`\n\n\n\n📘 Scraping ${data}...\n\n\n\n`);

//       // Each term is inside <a> tags within list items on the page
//       $("a").each((i, el) => {
//         const word = $(el).text().trim();
//         const href = $(el).attr("href");

//         // Filter only real Investopedia term links
//         if (href && href.includes("/terms/") && !href.includes("#") && word.length > 2 && word.length < 15) {
//           allTerms.push({
//             word,
//           });
//         }
//       });
//     } catch (err) {
//       console.error(`⚠️ Error fetching ${letter}: ${err.message}`);
//     }
//   }

//   // Remove duplicates
//   const unique = Array.from(new Set(allTerms.map((t) => t.word))).map((word) =>
//     allTerms.find((t) => t.word === word)
//   );

//   const exportString = `export default ${JSON.stringify(unique, null, 2)};`;
//   fs.writeFileSync("words.jsx", exportString);

//   console.log(`✅ ${unique.length} terms saved to words.jsx`);
// }

// scrapeInvestopedia();

import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const BASE = "https://www.investopedia.com";

async function scrapeInvestopedia() {
  try {
    const listUrl = `${BASE}/terms/a`;
    console.log(`🔍 Fetching: ${listUrl}`);
    const { data } = await axios.get(listUrl);
    const $ = cheerio.load(data);

    // Step 1: Extract word + link
    const links = [];
    $("a.dictionary-top300-list__list").each((i, el) => {
      const word = $(el).find("span.link__wrapper").text().trim();
      const url = $(el).attr("href");
      if (word && url) links.push({ word, url: url.startsWith("http") ? url : BASE + url });
    });

    console.log(`📚 Found ${links.length} words. Fetching definitions...`);

    const terms = [];

    // Step 2: Visit each term page and extract the first definition paragraph
    for (let i = 0; i < Math.min(links.length, 20); i++) { // limit to 20 for now
      const { word, url } = links[i];
      console.log(`📖 Scraping definition for: ${word}`);

      try {
        const { data: page } = await axios.get(url);
        const $$ = cheerio.load(page);

        // Usually definition is inside the first <p> under the main content
        const hint =
          $$("p").first().text().trim().replace(/\s+/g, " ") ||
          "Definition unavailable";

        terms.push({ word, hint });
      } catch (err) {
        console.warn(`⚠️ Skipped ${word}: ${err.message}`);
      }
    }

    // Step 3: Save to file
    fs.writeFileSync(
      "words.jsx",
      `export default ${JSON.stringify(terms, null, 2)};`
    );

    console.log(`🎉 Saved ${terms.length} terms to words.jsx`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

scrapeInvestopedia();

