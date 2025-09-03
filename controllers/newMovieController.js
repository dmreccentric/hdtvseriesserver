const NewMovie = require("../model/NewMovie");

// Get all movies (with optional filters)
const getAllMovies = async (req, res) => {
  try {
    const { genre, search, page = 1, limit } = req.query;

    // Build query object
    let query = {};

    // Filter by genre
    if (genre) {
      const genresArray = genre
        .split(",")
        .map((g) => g.trim())
        .map((g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase());
      query.genres = { $in: genresArray };
    }

    // Search by title (case-insensitive)
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const movies = await NewMovie.find(query).skip(skip).limit(parseInt(limit));

    // Total documents for pagination info
    const total = await NewMovie.countDocuments(query);

    res.status(200).json({
      movies,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      nbHits: movies.length,
    });
  } catch (error) {
    console.error("getAllMovies error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Get single movie
const getSingleMovie = async (req, res) => {
  try {
    const { id: movieID } = req.params;

    const movie = await NewMovie.findById(movieID);

    if (!movie) {
      return res.status(404).json({ msg: "Movie not found" });
    }

    res.status(200).json({ movie });
  } catch (error) {
    console.log("getSingleMovie error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Delete Movie
const deleteMovie = async (req, res) => {
  try {
    const { id: movieID } = req.params;

    const movie = await NewMovie.findByIdAndDelete(movieID);

    if (!movie) {
      return res.status(404).json({ msg: "Movie not found" });
    }

    res.status(200).json({ movie, msg: "Deleted Successfully" });
  } catch (error) {
    console.log("deleteMovie error:", error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getAllMovies,
  deleteMovie,
  getSingleMovie,
};
