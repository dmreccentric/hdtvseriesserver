// clearMovies.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Movie = require("./model/Movie"); // adjust path if needed

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function clearMovies() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    const result = await Movie.deleteMany({});
    console.log(`🗑️ Cleared ${result.deletedCount} movies from the database.`);

    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
  } catch (err) {
    console.error("❌ Error clearing movies:", err);
  }
}

clearMovies();
