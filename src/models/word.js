import mongoose from "mongoose";

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  hint: { type: String, required: true }
});

export default mongoose.model("Word", wordSchema);