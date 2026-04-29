const express = require('express');
const router = express.Router();
const SavedRepo = require('../models/SavedRepo');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// save a repo
router.post('/save', requireLogin, async (req, res) => {
  const { repo_name, repo_url, description, stars, language, open_issues, difficulty } = req.body;
  const username = req.session.user.username;

  try {
    await SavedRepo.create({
      username,
      repo_name,
      repo_url,
      description,
      stars: parseInt(stars),
      language,
      open_issues: parseInt(open_issues),
      difficulty
    });
  } catch (err) {
    // duplicate key means already saved — just ignore it
    if (err.code !== 11000) console.error('Save error:', err.message);
  }

  // go back to where they were
  const referer = req.get('Referer') || '/discover';
  res.redirect(referer);
});

// remove a saved repo
router.post('/remove', requireLogin, async (req, res) => {
  const { repo_name } = req.body;
  const username = req.session.user.username;

  try {
    await SavedRepo.deleteOne({ username, repo_name });
  } catch (err) {
    console.error('Remove error:', err.message);
  }

  res.redirect('/saved');
});

// saved issues list page
router.get('/saved', requireLogin, async (req, res) => {
  const username = req.session.user.username;

  try {
    const saved = await SavedRepo.find({ username }).sort({ saved_at: -1 });

    res.render('saved', {
      title: 'Saved',
      showNav: true,
      page: 'saved',
      user: req.session.user,
      saved
    });
  } catch (err) {
    console.error('Fetch saved error:', err.message);
    res.render('saved', {
      title: 'Saved',
      showNav: true,
      page: 'saved',
      user: req.session.user,
      saved: [],
      error: 'Could not load saved repos'
    });
  }
});

module.exports = router;