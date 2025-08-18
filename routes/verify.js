const express = require("express");
const router = express.Router();
const { verify } = require("../controllers/verify");

router.get("/verify", verify);

module.exports = router;
