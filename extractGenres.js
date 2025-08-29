const fs = require("fs");
const path = require("path");

// Load your mainMovies.json
const moviesPath = path.join(__dirname, "mainMovies.json");
const movies = JSON.parse(fs.readFileSync(moviesPath, "utf-8"));

// Use a Set to store unique genres
const uniqueGenres = new Set();

// Iterate through all movies and collect genres
movies.forEach((movie) => {
  if (Array.isArray(movie.genres)) {
    movie.genres.forEach((genre) => uniqueGenres.add(genre));
  }
});

// Convert Set to Array and sort
const genresArray = Array.from(uniqueGenres).sort();

// Print the array
console.log(genresArray);

// Optional: write to a file
fs.writeFileSync(
  path.join(__dirname, "allGenres.json"),
  JSON.stringify(genresArray, null, 2)
);

console.log(
  "All unique genres have been extracted and saved to allGenres.json"
);
