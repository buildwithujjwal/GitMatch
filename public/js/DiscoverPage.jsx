import { useState } from "react";
import "./style.css";

// ─── Types ────────────────────────────────────────────────────────────────────
/**
 * @typedef {Object} Repo
 * @property {string}   name
 * @property {string}   url
 * @property {string}   description
 * @property {number}   stars
 * @property {number}   forks
 * @property {number}   open_issues
 * @property {string}   language
 * @property {string[]} labels
 * @property {'beginner'|'intermediate'|'advanced'} difficulty
 */

// ─── Sub-components ───────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav>
      <span className="brand">GitMatch</span>
      <a href="/discover" className="active">Discover</a>
      <a href="/saved">Saved</a>
      <a href="/profile">Profile</a>
      <a href="/logout">Logout</a>
    </nav>
  );
}

function SaveButton({ repo }) {
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaved(true);

    await fetch("/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repo_name:   repo.name,
        repo_url:    repo.url,
        description: repo.description,
        stars:       repo.stars,
        language:    repo.language,
        open_issues: repo.open_issues,
        difficulty:  repo.difficulty,
      }),
    });

    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <button
      className="btn-save"
      onClick={handleSave}
      style={saved ? { background: "linear-gradient(135deg, #1A3A6A, #2DD4BF)" } : {}}
    >
      <span className="label-inner">{saved ? "✓ Saved" : "Save"}</span>
    </button>
  );
}

function RepoCard({ repo, index }) {
  return (
    <div className="repo-card" style={{ animationDelay: `${0.08 + index * 0.07}s` }}>

      <div className="card-top">
        <span className={`difficulty ${repo.difficulty}`}>{repo.difficulty}</span>
        <span className="lang-tag">{repo.language}</span>
      </div>

      <h3 className="repo-name">
        <a href={repo.url} target="_blank" rel="noopener noreferrer">
          {repo.name}
        </a>
      </h3>

      <p className="repo-desc">{repo.description}</p>

      <div className="label-list">
        {repo.labels.map((label) => (
          <span key={label} className="label">{label}</span>
        ))}
      </div>

      <div className="card-stats">
        <span>⭐ {repo.stars.toLocaleString()}</span>
        <span>🍴 {repo.forks.toLocaleString()}</span>
        <span>🐛 {repo.open_issues} issues</span>
      </div>

      <div className="card-actions">
        <SaveButton repo={repo} />
        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="btn-outline">
          <span>View on GitHub →</span>
        </a>
      </div>

    </div>
  );
}

function Pagination({ currentPage, hasMore }) {
  return (
    <div className="pagination">
      {currentPage > 1 && (
        <a href={`/discover?page=${currentPage - 1}`} className="btn-outline">
          <span>← Prev</span>
        </a>
      )}
      <span className="page-info">Page {currentPage}</span>
      {hasMore && (
        <a href={`/discover?page=${currentPage + 1}`} className="btn-outline">
          <span>Next →</span>
        </a>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * DiscoverPage
 *
 * Props:
 *   selected    {string[]}  — skill tags chosen by the user
 *   repos       {Repo[]}    — repositories returned from the API
 *   currentPage {number}    — current pagination page
 *   hasMore     {boolean}   — whether a next page exists
 *   error       {string}    — optional error message
 */
export default function DiscoverPage({
  selected = [],
  repos = [],
  currentPage = 1,
  hasMore = false,
  error = "",
}) {
  return (
    <>
      <Nav />

      <div className="container">

        {/* Header */}
        <div className="discover-header">
          <h2>Discover <em>repos</em></h2>
          <a href="/skills" className="btn-outline"><span>✦ Change Skills</span></a>
        </div>

        <div className="ornament" />

        {/* Selected skill tags */}
        <div className="tag-list" style={{ marginBottom: "24px" }}>
          {selected.map((skill) => (
            <span key={skill} className="tag">{skill}</span>
          ))}
        </div>

        {/* Error state */}
        {error && <p className="error">{error}</p>}

        {/* Empty state */}
        {repos.length === 0 && !error && (
          <p style={{ color: "var(--text-muted)" }}>
            No repos found for these skills. Try different ones.
          </p>
        )}

        {/* Repo grid */}
        <div className="card-grid">
          {repos.map((repo, i) => (
            <RepoCard key={repo.name} repo={repo} index={i} />
          ))}
        </div>

        {/* Pagination */}
        {repos.length > 0 && (
          <Pagination currentPage={currentPage} hasMore={hasMore} />
        )}

      </div>
    </>
  );
}
