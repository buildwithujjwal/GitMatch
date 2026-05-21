const axios = require("axios");
const User = require("../models/User");

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchGithubProfile(username, token) {
  const headers = { Authorization: `token ${token}` };
  const base = "https://api.github.com/users";

  const [{ data: profile }, { data: repos }] = await Promise.all([
    axios.get(`${base}/${username}`, { headers }),
    axios.get(`${base}/${username}/repos`, {
      headers,
      params: { per_page: 100, sort: "updated" },
    }),
  ]);

  const languages = {};
  const topics = {};

  repos.forEach(({ language, topics: repoTopics }) => {
    if (language) {
      languages[language] = (languages[language] || 0) + 1;
    }
    repoTopics?.forEach((topic) => {
      topics[topic] = (topics[topic] || 0) + 1;
    });
  });

  return {
    username: profile.login,
    name: profile.name || profile.login,
    bio: profile.bio || "",
    location: profile.location || "",
    avatar: profile.avatar_url,
    public_repos: profile.public_repos,
    followers: profile.followers,
    following: profile.following,
    created_at: profile.created_at?.split("T")[0],
    languages,
    topics,
  };
}

// ─── Controllers ────────────────────────────────────────────────────────────

const showLogin = (req, res) => {
  if (req.session.user) return res.redirect("/discover");
  res.render("login", { error: null });
};

const githubAuth = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect("/discover");
  next(); // passport.authenticate middleware handles the rest in the route
};

const githubCallback = async (req, res) => {
  console.log("OAuth user:", req.user);
  console.log("Session user:", req.session.user);

  try {
    const username = req.user.username;
    const accessToken = req.user.token || req.user.accessToken;

    const profile = await fetchGithubProfile(username, accessToken);

    await User.findOneAndUpdate(
      { username: profile.username },
      profile,
      { upsert: true, new: true }
    );

    req.session.user = profile;
    req.session.githubToken = accessToken;

    res.redirect("/skills");
  } catch (err) {
    console.error("OAuth callback error:", err.message);
    res.redirect("/login");
  }
};

const logout = (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
};

module.exports = { showLogin, githubAuth, githubCallback, logout };
