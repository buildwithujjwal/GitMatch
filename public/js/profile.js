// =====================================================
// GitMatch Profile Page - Client-side JavaScript
// =====================================================

(function () {
  "use strict";

  // Theme Management (identical to DiscoverPage.js)
  // =====================================================

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

  // Section Card Hover Effects (matches DiscoverPage.js issue cards)
  // =====================================================

  const cards = document.querySelectorAll(".profile-card, .section");

  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateX(4px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateX(0)";
    });
  });

  // Keyboard Navigation
  // =====================================================

  document.addEventListener("keydown", function (e) {
    // Toggle theme with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      toggleTheme();
    }
  });

  // Console Log
  // =====================================================

  console.log(
    "%c GitMatch ",
    "background: #5B6AF7; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;",
  );
  console.log("Profile page initialized successfully");
})();
