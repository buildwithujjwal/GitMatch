const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/auth");
const {
  saveIssue,
  removeIssue,
  showSaved,
  getBreakdown,
} = require("../controllers/savedController");

router.post("/save", requireLogin, saveIssue);
router.post("/remove", requireLogin, removeIssue);
router.get("/saved", requireLogin, showSaved);
router.post("/api/breakdown", requireLogin, getBreakdown);

module.exports = router;
