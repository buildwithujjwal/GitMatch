(function () {
  "use strict";

  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      body.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
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
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);


  const savedCards = document.querySelectorAll(".saved-card");

  savedCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateX(4px)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateX(0)";
    });
  });

  const removeForms = document.querySelectorAll('form[action="/remove"]');

  removeForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      const card = this.closest(".saved-card");
      if (!card) return;

      e.preventDefault();
      card.classList.add("removing");

      setTimeout(() => {
        form.submit();
        card.remove();

        const remaining = document.querySelectorAll(".saved-card").length;
        const badge = document.querySelector(".count-badge");
        if (badge) badge.textContent = remaining + " saved";

        if (remaining === 0) {
          const list = document.querySelector(".saved-list");
          if (list) list.remove();

          const container = document.querySelector(".container");
          if (container) {
            const emptyState = document.createElement("div");
            emptyState.className = "empty-state";
            emptyState.innerHTML = `
              <div class="empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 class="empty-title">Nothing saved yet</h3>
              <p class="empty-description">Start discovering issues that match your skills and save the ones you want to work on.</p>
              <a href="/discover" class="btn-primary">Discover Issues</a>
            `;
            container.appendChild(emptyState);
          }
        }
      }, 200);
    });
  });

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      toggleTheme();
    }
    // Close modal on Escape
    if (e.key === "Escape") closeModal();
  });


  const overlay    = document.getElementById("breakdown-overlay");
  const closeBtn   = document.getElementById("breakdown-close");
  const subtitle   = document.getElementById("breakdown-subtitle");
  const loadingEl  = document.getElementById("breakdown-loading");
  const errorEl    = document.getElementById("breakdown-error");
  const errorMsg   = document.getElementById("breakdown-error-msg");
  const contentEl  = document.getElementById("breakdown-content");

  // Content targets
  const elDebrief  = document.getElementById("bd-debrief");
  const elBadges   = document.getElementById("bd-badges");
  const elMeta     = document.getElementById("bd-insights-meta");
  const elSteps    = document.getElementById("bd-steps");
  const elIssueLink = document.getElementById("bd-open-issue");
  const elRepoLink  = document.getElementById("bd-open-repo");

  // Open modal
  function openModal() {
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => overlay.classList.add("is-open"));
  }

  // Close modal
  function closeModal() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  // Show loading state
  function showLoading() {
    loadingEl.hidden  = false;
    errorEl.hidden    = true;
    contentEl.hidden  = true;
  }

  // Show error state
  function showError(msg) {
    loadingEl.hidden  = true;
    errorEl.hidden    = false;
    contentEl.hidden  = true;
    errorMsg.textContent = msg || "Failed to generate breakdown. Please try again.";
  }

  // Show content state
  function showContent(breakdown, issueUrl, repoUrl) {
    loadingEl.style.display = "none";
    errorEl.style.display = "none";
    contentEl.hidden = false;
    contentEl.style.display = "block";
    loadingEl.hidden  = true;
    errorEl.hidden    = true;
    // contentEl.hidden  = false;

    // Debrief
    elDebrief.textContent = breakdown.debrief || "No summary available.";

    // Badges
    elBadges.innerHTML = "";
    if (breakdown.badges && breakdown.badges.length > 0) {
      breakdown.badges.forEach((label) => {
        const span = document.createElement("span");
        span.className = "bd-badge " + getBadgeClass(label);
        span.innerHTML = `
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          ${label}
        `;
        elBadges.appendChild(span);
      });
    }

    // Tech stack & prerequisites
    elMeta.innerHTML = "";
    if (breakdown.techStack) {
      const p = document.createElement("p");
      p.innerHTML = `<span class="bd-meta-label">Tech Stack:</span> ${breakdown.techStack}`;
      elMeta.appendChild(p);
    }
    if (breakdown.prerequisites) {
      const p = document.createElement("p");
      p.innerHTML = `<span class="bd-meta-label">Prerequisites:</span> ${breakdown.prerequisites}`;
      elMeta.appendChild(p);
    }

    // Steps
    elSteps.innerHTML = "";
    if (breakdown.steps && breakdown.steps.length > 0) {
      breakdown.steps.forEach((step) => {
        const li = document.createElement("li");
        li.className = "breakdown-step";
        li.textContent = step;
        elSteps.appendChild(li);
      });
    }

    // Footer links
    elIssueLink.href = issueUrl || "#";
    elRepoLink.href  = repoUrl  || "#";
  }

  // Badge variant helper
  function getBadgeClass(label) {
    const l = label.toLowerCase();
    if (l.includes("easy"))      return "bd-badge--green";
    if (l.includes("beginner"))  return "bd-badge--yellow";
    if (l.includes("good") || l.includes("contributing")) return "bd-badge--blue";
    return "bd-badge--green";
  }

  // Fetch breakdown from our Express endpoint
  async function fetchBreakdown(issueData) {
    const res = await fetch("/api/breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(issueData),
    });

    const data = await res.json();
    console.log("Response:", res.ok, data);

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Unknown error");
    }

    return data.breakdown;
  }

  // Wire up each "View More Details" button
  document.querySelectorAll(".btn-details").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const issueData = {
        issue_title:   this.dataset.issueTitle,
        issue_number:  this.dataset.issueNumber,
        repo_name:     this.dataset.repoName,
        repo_url:      this.dataset.repoUrl,
        issue_url:     this.dataset.issueUrl,
        language:      this.dataset.language,
        description:   this.dataset.description,
        labels:        this.dataset.labels,
      };

      // Set subtitle and open modal
      const shortTitle = issueData.issue_title.length > 55
        ? issueData.issue_title.slice(0, 55) + "…"
        : issueData.issue_title;
      subtitle.textContent = shortTitle;

      loadingEl.hidden = false;
      errorEl.hidden = true;
      contentEl.hidden = true;
      
      openModal();
      // showLoading();

      try {
        const breakdown = await fetchBreakdown(issueData);
        showContent(breakdown, issueData.issue_url, issueData.repo_url);
      } catch (err) {
        showError(err.message);
      }
    });
  });

  // Close handlers
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (overlay)  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });


  console.log(
    "%c GitMatch ",
    "background: #5B6AF7; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;"
  );
  console.log("Saved page initialized successfully");

})();
