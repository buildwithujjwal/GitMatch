const express = require("express");
const passport = require("passport");
const router = express.Router();
const {
  showLogin,
  githubAuth,
  githubCallback,
  logout,
} = require("../controllers/authController");

// login page
router.get("/login", showLogin);

// github auth
router.get(
  "/auth/github",
  githubAuth,
  passport.authenticate("github", { scope: ["user:email"] }),
);

// github callback
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  githubCallback,
);

// logout
router.get("/logout", logout);

module.exports = router;
