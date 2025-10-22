import fs from "fs";
import axios from "axios";

const API_KEY = "AIzaSyBqVox9xNc8o-XPKribpUJLRJW204p9k8w"; // 👈 Your Gemini API key
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

async function generateHint(word) {
  try {
    const response = await axios.post(GEMINI_ENDPOINT, {
      contents: [
        {
          parts: [
            {
              text: `Give a concise, one-sentence definition or hint for the financial or business term "${word}". Make it simple and clear enough for a word guessing game.`,
            },
          ],
        },
      ],
    });

    const hint =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "No hint generated.";
    return hint;
  } catch (error) {
    console.error(`❌ Error for "${word}":`, error.response?.data || error.message);
    return "Error generating hint.";
  }
}

async function generateHints() {
  const raw = fs.readFileSync("./words.jsx", "utf8");
  const match = raw.match(/\[\s*([\s\S]*)\s*\]/);
  if (!match) throw new Error("No array found in words.jsx");

  const words = JSON.parse(`[${match[1]}]`);
  const result = [];

  for (const { word } of words) {
    console.log(`🧠 Generating hint for: ${word}`);
    const hint = await generateHint(word);
    result.push({ word, hint });

    // Save incrementally
    fs.writeFileSync(
      "./wordsWithHints.jsx",
      `export default ${JSON.stringify(result, null, 2)};`
    );
  }

  console.log("✅ Hints generated and saved to wordsWithHints.jsx");
}

generateHints();
