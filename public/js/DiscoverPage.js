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
    body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "light" : "dark");
  }

  loadTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  const ITEMS_PER_PAGE = 12;
  const allCards = Array.from(document.querySelectorAll(".issue-card"));
  const loadMoreBtn = document.getElementById("load-more-btn");
  const loadMoreContainer = document.getElementById("load-more-container");
  const loadMoreMeta = document.getElementById("load-more-meta");

  // Track how many are currently visible (first page already shown by EJS)
  let visibleCount = Math.min(ITEMS_PER_PAGE, allCards.length);

  function updateMeta() {
    if (loadMoreMeta) {
      loadMoreMeta.textContent =
        "Showing " + visibleCount + " of " + allCards.length + " issues";
    }
  }

  function updateButton() {
    if (!loadMoreContainer) return;

    if (visibleCount >= allCards.length) {
      // All visible — remove the Load More section entirely
      loadMoreContainer.remove();
    } else {
      const remaining = allCards.length - visibleCount;
      const next = Math.min(remaining, ITEMS_PER_PAGE);
      const textEl =
        loadMoreBtn && loadMoreBtn.querySelector(".load-more-text");
      if (textEl) textEl.textContent = "Load " + next + " More";
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      loadMoreBtn.disabled = true;

      const from = visibleCount;
      const to = Math.min(visibleCount + ITEMS_PER_PAGE, allCards.length);

      // Reveal the next batch with a staggered fade-in
      for (let i = from; i < to; i++) {
        const card = allCards[i];
        card.style.display = ""; // remove the inline display:none
        card.style.opacity = "0";
        card.style.transform = "translateY(6px)";
        card.style.transition = "opacity 0.2s ease, transform 0.2s ease";
        card.style.transitionDelay = (i - from) * 40 + "ms";

        // Trigger the transition on the next frame
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          });
        });


        card.addEventListener("transitionend", function cleanup(e) {
          if (e.propertyName !== "opacity") return;
          card.style.transition = "";
          card.style.transitionDelay = "";
          card.style.opacity = "";
          card.style.transform = "";
          card.removeEventListener("transitionend", cleanup);
        });
      }

      visibleCount = to;
      updateMeta();

      // Re-enable button after the last card's animation finishes
      const delay = (to - from) * 40 + 250;
      setTimeout(function () {
        loadMoreBtn.disabled = false;
        updateButton();
      }, delay);
    });
  }

  document.querySelectorAll(".skill-remove").forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const skillTag = this.closest(".skill-tag");
      if (skillTag) {
        skillTag.style.opacity = "0";
        skillTag.style.transform = "scale(0.95)";
        skillTag.style.transition = "all 0.2s";
        setTimeout(function () {
          skillTag.remove();
        }, 200);
      }
    });
  });

  document.querySelectorAll(".save-form").forEach(function (form) {
    form.addEventListener("submit", function () {
      const button = this.querySelector(".btn-save");
      if (button && !button.disabled) {
        button.disabled = true;
        button.textContent = "Saving...";
      }
    });
  });

  const issuesList = document.querySelector(".issues-list");

  if (issuesList) {
    issuesList.addEventListener("mouseover", function (e) {
      const card = e.target.closest(".issue-card");
      if (card) card.style.transform = "translateX(4px)";
    });

    issuesList.addEventListener("mouseout", function (e) {
      const card = e.target.closest(".issue-card");
      if (card) card.style.transform = "translateX(0)";
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      toggleTheme();
    }
  });

  console.log(
    "%c GitMatch ",
    "background: #5B6AF7; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;",
  );
  console.log(
    "Discover — " +
      allCards.length +
      " cards total, showing first " +
      visibleCount,
  );
})();
