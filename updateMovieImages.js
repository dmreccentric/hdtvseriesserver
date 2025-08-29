const fs = require("fs");
const path = require("path");

// Path to your mainMovies.json
const moviesPath = path.join(__dirname, "mainMovies.json");

// Placeholder image URL
const placeholderUrl =
  "https://res.cloudinary.com/dzhhpr7f1/image/upload/v1755246293/no-image-placeholder_arffdk.png";

// Read the JSON file
const rawData = fs.readFileSync(moviesPath, "utf-8");
const movies = JSON.parse(rawData);

// Iterate and replace img and himg
const updatedMovies = movies.map((movie) => ({
  ...movie,
  img: placeholderUrl,
  himg: placeholderUrl,
}));

// Write back to JSON file
fs.writeFileSync(moviesPath, JSON.stringify(updatedMovies, null, 2), "utf-8");

console.log(
  `✅ Updated ${updatedMovies.length} movies with placeholder images.`
);
