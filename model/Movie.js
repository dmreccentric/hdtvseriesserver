const mongoose = require("mongoose");

const EpisodeSchema = new mongoose.Schema({
  episodeNumber: { type: Number },
  title: { type: String }, // E1: A Whole New Whirled
  description: { type: String }, // optional
  releases: [
    {
      quality: {
        type: String,
        enum: ["480p", "720p", "1080p"],
        required: true,
      },
      size: { type: String }, // e.g. "283.39MB"
      downloadUrl: { type: String },
      streamUrl: { type: String },
      telegramUrl: { type: String },
    },
  ],
});

const SeasonSchema = new mongoose.Schema({
  seasonNumber: { type: Number },
  episodes: [EpisodeSchema],
});

const MovieSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "please provide a title"] },
    genres: {
      type: [String],
      enum: [
        "Action",
        "Adventure",
        "Alternate History",
        "Animation",
        "Anime",
        "Biography",
        "Business",
        "Career",
        "Comedy",
        "Competition",
        "Crime",
        "Documentary",
        "Drama",
        "Family",
        "Fantasy",
        "Historical",
        "History",
        "Horror",
        "Legal",
        "Martial Arts",
        "Medical",
        "Military",
        "Music",
        "Mystery",
        "News",
        "Police",
        "Procedural",
        "Psychological",
        "Reality",
        "Religious",
        "Romance",
        "Satire",
        "Sci-Fi",
        "Sitcom",
        "Social Experiment",
        "Sports",
        "Spy",
        "Superhero",
        "Supernatural",
        "Survival",
        "Teen",
        "Thriller",
        "War",
        "Western",
      ],

      required: [true, "please provide at least one genre"],
    },
    plot: { type: String, required: [true, "plot must be provided"] },
    link: { type: String },
    trailer: { type: String },
    rating: { type: Number },
    img: { type: String },
    himg: { type: String },
    released: { type: Number },
    language: {
      type: String,
      enum: ["English", "French", "Hindi", "others", "Korean", "Spanish"],
    },
    type: {
      type: String,
      enum: ["Movie", "Series", "Reality"],
      required: [true, "type must be specified"],
    },
    status: {
      type: String,
      enum: ["Ongoing", "Completed"],
    },
    seasons: {
      type: [SeasonSchema],
      default: undefined,
    },
    seasonNumber: {
      type: Number,
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
