import mongoose from "mongoose";
import Word from "../models/word.js";
import words from "../components/words.js";


const uri = "mongodb+srv://Eyob:%2314%40eyob@wordpuzzle.to1irl3.mongodb.net/?retryWrites=true&w=majority&appName=WordPuzzle";

async function seedDB() {
  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // // optional: clear old data
    // await Word.deleteMany({});
    // console.log("🧹 Old data cleared");

    // insert all words
    await Word.insertMany(words);
    console.log(`🎉 Inserted ${words.length} words successfully!`);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedDB();
