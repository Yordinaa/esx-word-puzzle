import express from "express";
import Word from "../models/word.js"; 

const app = express();

app.use(express.json());

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
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
