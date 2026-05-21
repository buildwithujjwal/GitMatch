const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/auth");
const {
  showDiscover,
  getRateLimit,
} = require("../controllers/harvestController");

router.get("/discover", requireLogin, showDiscover);
router.get("/rate-limit", getRateLimit);

module.exports = router;
