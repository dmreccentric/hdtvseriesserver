const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
} = require("../controllers/updateController");
const { verifyUser } = require("../middlewares/auth");

router.route("/").get(getAllUsers);
router.route("/:id").get(verifyUser, getUserById).put(verifyUser, updateUser);

module.exports = router;
