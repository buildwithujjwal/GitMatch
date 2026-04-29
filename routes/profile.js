const express = require('express');
const router = express.Router();

// middleware to block logged-out users
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

router.get('/profile', requireLogin, (req, res) => {
  res.render('profile', {
    title: 'Profile',
    showNav: true,
    page: 'profile',
    user: req.session.user
  });
});

module.exports = router;