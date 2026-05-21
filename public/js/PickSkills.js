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

  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"][name="skills"]',
  );
  const countBadge = document.getElementById("selected-count");
  const submitBtn = document.getElementById("submit-btn");

  function updateCount() {
    const checked = document.querySelectorAll(
      'input[type="checkbox"][name="skills"]:checked',
    );
    const n = checked.length;

    if (countBadge) {
      if (n > 0) {
        countBadge.textContent = n + " selected";
        countBadge.style.display = "inline-flex";
      } else {
        countBadge.style.display = "none";
      }
    }

    if (submitBtn) {
      submitBtn.disabled = n === 0;
    }
  }

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", updateCount);
  });

  // Run once on load to reflect server-rendered checked state
  updateCount();

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", function () {
      const tag = this.nextElementSibling;
      if (!tag) return;

      tag.style.transform = "scale(0.95)";
      setTimeout(() => {
        tag.style.transform = "";
      }, 150);
    });
  });

  document.addEventListener("keydown", function (e) {
    // Toggle theme with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      toggleTheme();
    }
  });

  console.log(
    "%c GitMatch ",
    "background: #5B6AF7; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;",
  );
  console.log("Skills page initialized successfully");
})();
