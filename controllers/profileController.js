const showProfile = (req, res) => {
  res.render("profile", {
    title: "Profile",
    showNav: true,
    page: "profile",
    user: req.session.user,
  });
};

module.exports = { showProfile };
