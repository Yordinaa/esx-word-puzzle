import mongoose from "mongoose";



mongoose.connect("mongodb+srv://Eyob:%2314%40eyob@wordpuzzle.to1irl3.mongodb.net/?retryWrites=true&w=majority&appName=WordPuzzle")
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));
