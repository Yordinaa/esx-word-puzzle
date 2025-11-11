// src/scripts/updateDifficulties.js
import mongoose from "mongoose";
import Word from "../models/word.js";

const MONGODB_URI = "mongodb+srv://Eyob:%2314%40eyob@wordpuzzle.to1irl3.mongodb.net/?retryWrites=true&w=majority&appName=WordPuzzle";

async function updateDifficulties() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Update all words to have a difficulty based on word length
    const words = await Word.find({});
    console.log(`Found ${words.length} words to update`);

    for (const word of words) {
      const length = word.word.length;
      let difficulty = 'intermediate'; // default
      
      if (length <= 5) {
        difficulty = 'beginner';
      } else if (length >= 8) {
        difficulty = 'advanced';
      }

      await Word.findByIdAndUpdate(word._id, { difficulty });
    }

    console.log("✅ All words updated with difficulty levels");
    
  } catch (error) {
    console.error("Error updating difficulties:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateDifficulties();