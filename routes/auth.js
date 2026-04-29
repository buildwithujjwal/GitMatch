const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// helper — fetch and aggregate user data from github
async function fetchGithubProfile(username) {
  const headers = { Authorization: `token ${GITHUB_TOKEN}` };
  const base = 'https://api.github.com';

  // basic profile
  const { data: profile } = await axios.get(`${base}/users/${username}`, { headers });

  // grab up to 100 repos to count languages and topics
  const { data: repos } = await axios.get(`${base}/users/${username}/repos`, {
    headers,
    params: { per_page: 100, sort: 'updated' }
  });

  const languages = {};
  const topics = {};

  repos.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
    repo.topics?.forEach(topic => {
      topics[topic] = (topics[topic] || 0) + 1;
    });
  });

  return {
    username: profile.login,
    name: profile.name || profile.login,
    bio: profile.bio || '',
    location: profile.location || '',
    avatar: profile.avatar_url,
    public_repos: profile.public_repos,
    followers: profile.followers,
    following: profile.following,
    created_at: profile.created_at?.split('T')[0],
    languages,
    topics
  };
}

// GET /login
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/discover');
  res.render('login', { error: null });
});

// POST /login
router.post('/login', async (req, res) => {
  const { username } = req.body;

  if (!username || username.trim() === '') {
    return res.render('login', { error: 'Please enter a valid username' });
  }

  try {
    const profileData = await fetchGithubProfile(username.trim());

    // upsert — update if exists, create if not
    const user = await User.findOneAndUpdate(
      { username: profileData.username },
      profileData,
      { upsert: true, new: true }
    );

    // save to session
    req.session.user = profileData;

    res.redirect('/profile');
  } catch (err) {
    // 404 from github means user doesn't exist
    if (err.response?.status === 404) {
      return res.render('login', { error: 'GitHub user not found' });
    }
    console.error('Login error:', err.message);
    res.render('login', { error: 'Something went wrong, try again' });
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;