const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/auth");
const { showProfile } = require("../controllers/profileController");

router.get("/profile", requireLogin, showProfile);

module.exports = router;
