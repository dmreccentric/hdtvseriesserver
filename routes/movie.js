const express = require("express");
const router = express.Router();
const {
  getAllMovies,
  createMovie,
  editMovie,
  deleteMovie,
  getSingleMovie,
} = require("../controllers/movieController");
const { verifyUser } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.route("/").get(getAllMovies);

// routes/movieRoutes.js
router.route("/").post(
  verifyUser,
  upload.fields([
    { name: "img", maxCount: 1 },
    { name: "himg", maxCount: 1 },
  ]),
  createMovie
);

router
  .route("/:id")
  .patch(
    verifyUser,
    upload.fields([
      { name: "img", maxCount: 1 },
      { name: "himg", maxCount: 1 },
    ]),
    editMovie
  )
  .delete(verifyUser, deleteMovie)
  .get(getSingleMovie);

module.exports = router;
