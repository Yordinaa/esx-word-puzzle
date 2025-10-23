import express from "express";
import mongoose from "mongoose";
import Word from "../models/word.js";
import cors from "cors";


const app = express();
app.use(cors());
app.use(express.json());



// ✅ Connect to MongoDB
const MONGO_URI = "mongodb+srv://Eyob:%2314%40eyob@wordpuzzle.to1irl3.mongodb.net/?retryWrites=true&w=majority&appName=WordPuzzle";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));



// ✅ New API endpoint: fetch a batch of words
app.get("/api/wordbatch", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 300; // default 50 words per batch
    const words = await Word.aggregate([{ $sample: { size: limit } }]); // random sample from MongoDB
    // Map to only include what frontend needs
    const formattedWords = words.map(w => ({ word: w.word, hint: w.hint }));
    res.json(formattedWords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch word batch" });
  }
});

// ✅ Optional: single random word endpoint for backward compatibility
app.get("/api/word", async (req, res) => {
  try {
    const count = await Word.countDocuments();
    const random = Math.floor(Math.random() * count);
    const word = await Word.findOne().skip(random);
    res.json(word);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch word" });
  }
});

// ✅ Start server
// app.listen(3000, () => {
//   console.log("Server running on port 3000");
// });

