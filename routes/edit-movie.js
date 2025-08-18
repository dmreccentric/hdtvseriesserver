const express = require("express");
const router = express.Router();
const { verify } = require("../controllers/verify");
const {
  createMovie,
  editMovie,
  deleteMovie,
} = require("../controllers/movieController");
const upload = require("../middlewares/upload");

router.route("/").post(upload.single("img"), createMovie);
router
  .route("/:id")
  .patch(upload.single("img"), verify, editMovie)
  .delete(verify, deleteMovie);

module.exports = router;
