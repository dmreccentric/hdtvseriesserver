const mongoose = require("mongoose");

const EpisodeSchema = new mongoose.Schema({
  episodeNumber: { type: Number, required: true },
});

const SeasonSchema = new mongoose.Schema({
  seasonNumber: { type: Number, required: true },
  episodes: [EpisodeSchema],
});

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "please provide a title"],
    },
    genres: {
      type: [String],
      enum: [
        "Action",
        "Adventure",
        "Animation",
        "Biography",
        "Comedy",
        "Crime",
        "Documentary",
        "Drama",
        "Fantasy",
        "Historical",
        "Horror",
        "Musical",
        "Mystery",
        "Romance",
        "Sci-Fi",
        "Thriller",
        "War",
        "Western",
        "Family",
      ],
      required: [true, "please provide at least one genre"],
    },
    plot: {
      type: String,
      required: [true, "plot must be provided"],
    },
    link: {
      type: String,
    },
    trailer: {
      type: String,
    },
    rating: {
      type: Number,
    },
    img: {
      type: String,
      required: false,
      // [true, "item image must be provided"]
    },
    himg: {
      type: String,
      required: false,
    },
    released: {
      type: Number,
    },
    language: {
      type: String,
      enum: ["English", "French", "Hindi", "others", "Korean", "Spanish"],
    },
    type: {
      type: String,
      enum: ["Movie", "Series", "Reality"],
      required: [true, "type must be specified"],
    },
    seasons: {
      type: [SeasonSchema],
      default: undefined, // only adds this if data is provided
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", MovieSchema);
