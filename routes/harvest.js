const express = require('express');
const router = express.Router();
const axios = require('axios');
const Cache = require('../models/Cache');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// maps skill names to github search qualifiers
function buildQuery(skills) {
  const langMap = {
    'HTML/CSS': 'HTML',
    'Node.js': 'JavaScript',
    '.NET': 'C#',
  };

  const topicSkills = [
    'React', 'Vue', 'Angular', 'Next.js', 'Django', 'Flask',
    'FastAPI', 'Spring', 'Laravel', 'Flutter', 'TensorFlow',
    'PyTorch', 'Docker', 'Kubernetes'
  ];

  const parts = [];

  skills.forEach(skill => {
    if (topicSkills.includes(skill)) {
      parts.push(`topic:${skill.toLowerCase()}`);
    } else {
      const lang = langMap[skill] || skill;
      parts.push(`language:"${lang}"`);
    }
  });

  // only repos with open issues, decent size
  return parts.join(' ') + ' has:issues is:public stars:>50';
}

// work out difficulty from star count
function getDifficulty(stars) {
  if (stars < 500) return 'beginner';
  if (stars < 5000) return 'intermediate';
  return 'advanced';
}

// generate some labels based on repo data
function getLabels(repo) {
  const labels = [];
  if (repo.open_issues_count > 50) labels.push('help wanted');
  if (repo.stargazers_count < 500) labels.push('good first issue');
  if (['JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(repo.language)) labels.push('frontend');
  if (['Go', 'Rust', 'C', 'C++'].includes(repo.language)) labels.push('systems');
  if (['Python', 'Java', 'Ruby', 'PHP'].includes(repo.language)) labels.push('backend');
  return labels.slice(0, 3);
}

async function searchRepos(query, page = 1) {
  const cacheKey = `${query}__page${page}`;

  // check cache first
  const cached = await Cache.findOne({ query: cacheKey });
  if (cached) {
    console.log('cache hit:', cacheKey);
    return { results: cached.results, has_more: cached.has_more, fromCache: true };
  }

  const headers = { Authorization: `token ${GITHUB_TOKEN}` };
  const perPage = 12;

  const { data } = await axios.get('https://api.github.com/search/repositories', {
    headers,
    params: {
      q: query,
      sort: 'updated',
      order: 'desc',
      per_page: perPage,
      page
    }
  });

  const results = data.items
    .filter(r => r.open_issues_count > 0)
    .map(repo => ({
      name: repo.full_name,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      description: repo.description || 'No description provided',
      language: repo.language || 'Unknown',
      open_issues: repo.open_issues_count,
      difficulty: getDifficulty(repo.stargazers_count),
      labels: getLabels(repo)
    }));

  const has_more = data.total_count > page * perPage;

  // save to cache
  await Cache.create({ query: cacheKey, results, has_more });

  return { results, has_more, fromCache: false };
}

router.get('/discover', requireLogin, async (req, res) => {
  const selected = req.session.selectedSkills || [];

  // no skills picked yet — send them to skill selector
  if (selected.length === 0) return res.redirect('/skills');

  const page = parseInt(req.query.page) || 1;
  const query = buildQuery(selected);

  try {
    const { results, has_more } = await searchRepos(query, page);

    res.render('discover', {
      title: 'Discover',
      showNav: true,
      page: 'discover',
      user: req.session.user,
      repos: results,
      currentPage: page,
      has_more,
      selected
    });
  } catch (err) {
    console.error('Search error:', err.message);
    res.render('discover', {
      title: 'Discover',
      showNav: true,
      page: 'discover',
      user: req.session.user,
      repos: [],
      currentPage: 1,
      has_more: false,
      selected,
      error: 'Failed to fetch repos, try again shortly'
    });
  }
});

module.exports = router;