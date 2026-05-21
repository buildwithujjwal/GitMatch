(function () {
  "use strict";

  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      body.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      body.classList.toggle("dark", prefersDark);
      localStorage.setItem("theme", prefersDark ? "dark" : "light");
    }
  }

  function toggleTheme() {
    const isDark = body.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";
    body.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  }

  loadTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      toggleTheme();
    }
  });

  const btnGithub = document.querySelector(".btn-github");

  if (btnGithub) {
    btnGithub.addEventListener("click", function () {
      this.style.opacity = "0.6";
      this.style.pointerEvents = "none";
      this.textContent = "Redirecting…";
    });
  }
  
  console.log(
    "%c GitMatch ",
    "background: #5B6AF7; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;",
  );
  console.log("Login page initialized successfully");
})();
