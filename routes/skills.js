const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/auth");
const { showSkills, saveSkills } = require("../controllers/Skillscontroller");

router.get("/skills", requireLogin, showSkills);
router.post("/skills", requireLogin, saveSkills);

module.exports = router;
