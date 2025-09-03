const express = require("express");
const router = express.Router();
const {
  getAllMovies,
  deleteMovie,
  getSingleMovie,
} = require("../controllers/newMovieController");
const { verifyUser } = require("../middlewares/auth");

router.route("/").get(getAllMovies);

router.route("/:id").delete(verifyUser, deleteMovie).get(getSingleMovie);

module.exports = router;
