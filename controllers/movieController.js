const Movie = require("../model/Movie");

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
    const movies = await Movie.find(query).skip(skip).limit(parseInt(limit));

    // Total documents for pagination info
    const total = await Movie.countDocuments(query);

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

    const movie = await Movie.findById(movieID);

    if (!movie) {
      return res.status(404).json({ msg: "Movie not found" });
    }

    res.status(200).json({ movie });
  } catch (error) {
    console.log("getSingleMovie error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Create Movie
const createMovie = async (req, res) => {
  try {
    const {
      title,
      type,
      genres,
      plot,
      language,
      trailer,
      link,
      rating,
      released,
      seasons,
      status,
      seasonNumber,
    } = req.body;

    // Parse genres
    let parsedGenres = [];
    if (genres) {
      try {
        parsedGenres = JSON.parse(genres);
      } catch {
        parsedGenres = genres.split(",").map((g) => g.trim());
      }
    }
    parsedGenres = parsedGenres.map(
      (g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
    );

    // Parse seasons/episodes/releases if provided
    let parsedSeasons = undefined;
    if (seasons) {
      try {
        parsedSeasons = JSON.parse(seasons);
      } catch {
        parsedSeasons = seasons; // fallback
      }
    }

    const movieData = {
      title,
      type,
      genres: parsedGenres,
      plot,
      img: req.files?.img?.[0]?.path || "",
      himg: req.files?.himg?.[0]?.path || "",
      createdBy: req.user?.userID || null,
    };

    if (link) movieData.link = link;
    if (rating) movieData.rating = Number(rating);
    if (released) movieData.released = Number(released);
    if (language) movieData.language = language;
    if (trailer) movieData.trailer = trailer;
    if (status) movieData.status = status;
    if (seasonNumber) movieData.status = seasonNumber;
    if (parsedSeasons) movieData.seasons = parsedSeasons;

    const movie = await Movie.create(movieData);
    res.status(201).json({ movie });
  } catch (error) {
    console.error("createMovie error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Edit Movie
const editMovie = async (req, res) => {
  try {
    const { id: movieID } = req.params;
    const updates = { ...req.body };

    if (req.files?.img?.[0]?.path) updates.img = req.files.img[0].path;
    if (req.files?.himg?.[0]?.path) updates.himg = req.files.himg[0].path;

    // Parse genres
    if (updates.genres) {
      try {
        let parsedGenres = JSON.parse(updates.genres);
        updates.genres = parsedGenres.map(
          (g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase()
        );
      } catch {
        updates.genres = updates.genres
          .split(",")
          .map((g) => g.trim())
          .map((g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase());
      }
    }

    // Parse seasons/episodes/releases
    if (updates.seasons) {
      try {
        updates.seasons = JSON.parse(updates.seasons);
      } catch {
        // fallback — assume it’s already a proper JSON object
      }
    }

    // Convert rating/released to numbers
    if (updates.rating) updates.rating = Number(updates.rating);
    if (updates.status) updates.status = updates.status;
    if (updates.seasonNumber) updates.seasonNumber = updates.seasonNumber;
    if (updates.released) updates.released = Number(updates.released);

    const updated = await Movie.findByIdAndUpdate(movieID, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ msg: "Movie not found" });
    }

    res.status(200).json({ updated, msg: "Edited Successfully" });
  } catch (error) {
    console.error("editMovie error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Delete Movie
const deleteMovie = async (req, res) => {
  try {
    const { id: movieID } = req.params;

    const movie = await Movie.findByIdAndDelete(movieID);

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
  createMovie,
  editMovie,
  deleteMovie,
  getSingleMovie,
};
