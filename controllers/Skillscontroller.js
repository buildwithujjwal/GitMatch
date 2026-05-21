// all skills users can pick from
const SKILLS = {
  languages: [
    "JavaScript",
    "TypeScript",
    "Python",
    "Go",
    "Rust",
    "Java",
    "C++",
    "C#",
    "Ruby",
    "PHP",
    "Swift",
    "Kotlin",
    "HTML/CSS",
    "Shell",
    "Dart",
  ],
  frameworks: [
    "React",
    "Vue",
    "Angular",
    "Next.js",
    "Node.js",
    "Django",
    "Flask",
    "FastAPI",
    "Spring",
    "Laravel",
    "Flutter",
    "TensorFlow",
    "PyTorch",
    "Docker",
    "Kubernetes",
  ],
};

const showSkills = (req, res) => {
  const user = req.session.user;

  // pull user's own languages to show at top
  const userLangs = Object.keys(user.languages || {})
    .sort((a, b) => user.languages[b] - user.languages[a])
    .slice(0, 6);

  res.render("skills", {
    title: "Pick Skills",
    showNav: true,
    page: "skills",
    user,
    userLangs,
    skills: SKILLS,
    selected: req.session.selectedSkills || [],
  });
};

const saveSkills = (req, res) => {
  // checkboxes come in as array or single string
  let selected = req.body.skills || [];
  if (typeof selected === "string") selected = [selected];

  req.session.selectedSkills = selected;
  res.redirect("/discover");
};

module.exports = { showSkills, saveSkills };
