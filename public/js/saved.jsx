import { useState, useEffect } from "react";

/* ─── Mock data for development ─── */
const MOCK_SAVED = [
  {
    repo_name: "vercel/next.js",
    repo_url: "https://github.com/vercel/next.js",
    description: "The React Framework for the Web. Used by some of the world's largest companies, Next.js enables you to create high-quality web applications.",
    language: "TypeScript",
    stars: 122400,
    open_issues: 2843,
    difficulty: "medium",
    saved_at: "2025-04-18T10:30:00Z",
  },
  {
    repo_name: "astro-build/astro",
    repo_url: "https://github.com/withastro/astro",
    description: "The web framework for content-driven websites. Build fast, flexible sites with your favourite UI components.",
    language: "TypeScript",
    stars: 48200,
    open_issues: 412,
    difficulty: "easy",
    saved_at: "2025-04-21T14:10:00Z",
  },
  {
    repo_name: "tokio-rs/tokio",
    repo_url: "https://github.com/tokio-rs/tokio",
    description: "A runtime for writing reliable asynchronous applications with Rust. Provides I/O, networking, scheduling, timers and more.",
    language: "Rust",
    stars: 26700,
    open_issues: 198,
    difficulty: "hard",
    saved_at: "2025-04-25T08:45:00Z",
  },
  {
    repo_name: "django/django",
    repo_url: "https://github.com/django/django",
    description: "The Web framework for perfectionists with deadlines.",
    language: "Python",
    stars: 81500,
    open_issues: 256,
    difficulty: "medium",
    saved_at: "2025-04-27T17:00:00Z",
  },
];

/* ─── Styles ─── */
const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
@keyframes gm-fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes gm-slideDown{ from{transform:translateY(-56px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes gm-breathe  { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
@keyframes gm-cardIn   { from{opacity:0;transform:translateY(24px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes gm-shake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 60%{transform:translateX(4px)} }
@keyframes gm-fadeOut  { from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(.95)} }
@keyframes gm-spin     { to{transform:rotate(360deg)} }
`;

const CSS_VARS = `
.gm-root {
  --bg-void:#080c12;--bg-deep:#0d1320;--bg-surface:#111827;
  --bg-raised:#162032;--bg-hover:#1c2a40;
  --border-subtle:rgba(56,100,160,.18);--border-mid:rgba(56,120,200,.30);
  --blue-dim:#1e3a5f;--blue-mid:#2563eb;--blue-bright:#3b82f6;
  --blue-text:#93c5fd;
  --text-primary:#e2e8f0;--text-secondary:#8b9cbb;--text-muted:#4a5a72;
  --green:#22c55e;--green-dim:rgba(34,197,94,.12);
  --amber:#f59e0b;--amber-dim:rgba(245,158,11,.12);
  --red:#ef4444;--red-dim:rgba(239,68,68,.10);
  --ff-display:'DM Sans','Segoe UI',sans-serif;
  --ff-mono:'JetBrains Mono','Fira Code',monospace;
  --r-sm:6px;--r-md:10px;--r-lg:16px;
  --ease:200ms cubic-bezier(.4,0,.2,1);
  --spring:350ms cubic-bezier(.34,1.56,.64,1);
}
`;

const STYLES = `
.gm-root{font-family:var(--ff-display);font-size:15px;line-height:1.6;
  color:var(--text-primary);background:var(--bg-void);min-height:100vh;overflow-x:hidden;position:relative;}
.gm-root *{box-sizing:border-box;margin:0;padding:0;}
.gm-root::before{content:'';position:fixed;top:-20%;left:-10%;width:60%;height:60%;
  background:radial-gradient(ellipse,rgba(37,99,235,.07) 0%,transparent 65%);
  pointer-events:none;z-index:0;animation:gm-breathe 8s ease-in-out infinite;}
.gm-root::after{content:'';position:fixed;bottom:-10%;right:-5%;width:50%;height:50%;
  background:radial-gradient(ellipse,rgba(15,50,120,.06) 0%,transparent 65%);pointer-events:none;z-index:0;}

/* nav */
.gm-nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:4px;
  padding:0 24px;height:56px;background:rgba(8,12,18,.85);
  border-bottom:1px solid var(--border-subtle);backdrop-filter:blur(12px);
  animation:gm-slideDown .5s var(--spring);}
.gm-brand{font-family:var(--ff-mono);font-size:15px;font-weight:500;
  color:var(--blue-bright);letter-spacing:-.01em;margin-right:auto;}
.gm-brand::before{content:'> ';color:var(--text-muted);font-size:13px;}
.gm-nav-link{color:var(--text-secondary);text-decoration:none;font-size:13px;
  padding:6px 12px;border-radius:var(--r-sm);cursor:pointer;
  background:transparent;border:none;letter-spacing:.01em;
  transition:color var(--ease),background var(--ease);}
.gm-nav-link:hover{color:var(--text-primary);background:var(--bg-hover);}
.gm-nav-link.active{color:var(--blue-text);background:rgba(37,99,235,.12);}

/* container */
.gm-container{position:relative;z-index:1;max-width:820px;margin:0 auto;padding:52px 24px 80px;}

/* header */
.gm-header{display:flex;align-items:baseline;gap:12px;margin-bottom:36px;animation:gm-fadeUp .6s .1s both;}
.gm-heading{font-size:26px;font-weight:600;letter-spacing:-.03em;line-height:1.2;}
.gm-count-badge{font-family:var(--ff-mono);font-size:11px;color:var(--blue-text);
  background:rgba(37,99,235,.15);border:1px solid rgba(59,130,246,.3);
  padding:2px 9px;border-radius:20px;}

/* error */
.gm-error{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);
  color:#fca5a5;padding:12px 16px;border-radius:var(--r-md);font-size:13px;margin-bottom:24px;
  animation:gm-fadeUp .4s both;}

/* empty state */
.gm-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:80px 24px;text-align:center;animation:gm-fadeUp .6s .2s both;}
.gm-empty-icon{font-size:40px;margin-bottom:16px;opacity:.35;line-height:1;}
.gm-empty-text{color:var(--text-secondary);font-size:15px;margin-bottom:20px;}
.gm-empty-link{display:inline-flex;align-items:center;gap:6px;padding:10px 22px;
  font-size:14px;font-weight:500;color:#dbeafe;
  background:linear-gradient(135deg,#1d4ed8,#2563eb);
  border:1px solid rgba(96,165,250,.35);border-radius:var(--r-md);
  text-decoration:none;cursor:pointer;
  transition:transform var(--ease),box-shadow var(--ease),filter var(--ease);}
.gm-empty-link:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(37,99,235,.35);filter:brightness(1.08);}

/* card grid */
.gm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px;}

/* card */
.gm-card{background:var(--bg-surface);border:1px solid var(--border-subtle);
  border-radius:var(--r-lg);padding:22px;
  display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden;
  transition:border-color var(--ease),transform var(--ease),box-shadow var(--ease);}
.gm-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(59,130,246,.25),transparent);
  opacity:0;transition:opacity var(--ease);}
.gm-card:hover{border-color:var(--border-mid);transform:translateY(-2px);
  box-shadow:0 8px 32px rgba(0,0,0,.35);}
.gm-card:hover::before{opacity:1;}
.gm-card.removing{animation:gm-fadeOut .35s var(--ease) forwards;}

/* card top row */
.gm-card-top{display:flex;align-items:center;gap:8px;}

/* difficulty badge */
.gm-diff{font-family:var(--ff-mono);font-size:10px;font-weight:500;
  padding:3px 9px;border-radius:20px;letter-spacing:.06em;text-transform:uppercase;}
.gm-diff.easy  {color:#86efac;background:var(--green-dim);border:1px solid rgba(34,197,94,.25);}
.gm-diff.medium{color:#fcd34d;background:var(--amber-dim);border:1px solid rgba(245,158,11,.25);}
.gm-diff.hard  {color:#fca5a5;background:var(--red-dim);  border:1px solid rgba(239,68,68,.25);}

/* language tag */
.gm-lang{font-family:var(--ff-mono);font-size:10px;color:var(--blue-text);
  background:rgba(37,99,235,.12);border:1px solid rgba(59,130,246,.22);
  padding:3px 9px;border-radius:20px;margin-left:auto;letter-spacing:.04em;}

/* repo name */
.gm-repo-name{font-size:15px;font-weight:500;letter-spacing:-.01em;line-height:1.3;}
.gm-repo-name a{color:var(--text-primary);text-decoration:none;
  transition:color var(--ease);}
.gm-repo-name a:hover{color:var(--blue-text);}

/* description */
.gm-desc{font-size:13px;color:var(--text-secondary);line-height:1.55;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}

/* stats */
.gm-stats{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:2px;}
.gm-stat{font-family:var(--ff-mono);font-size:11.5px;color:var(--text-muted);
  display:flex;align-items:center;gap:5px;}
.gm-stat-icon{font-size:12px;}
.gm-saved-at{font-size:11px;color:var(--text-muted);margin-left:auto;
  font-family:var(--ff-mono);letter-spacing:.01em;}

/* divider */
.gm-card-divider{border:none;border-top:1px solid var(--border-subtle);margin:0;}

/* actions */
.gm-actions{display:flex;align-items:center;gap:8px;margin-top:2px;}
.gm-btn-github{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;
  font-size:12.5px;font-weight:500;color:var(--blue-text);
  background:rgba(37,99,235,.08);border:1px solid rgba(59,130,246,.25);
  border-radius:var(--r-sm);text-decoration:none;cursor:pointer;font-family:var(--ff-display);
  transition:background var(--ease),border-color var(--ease),transform var(--ease);}
.gm-btn-github:hover{background:rgba(37,99,235,.18);border-color:rgba(59,130,246,.45);transform:translateY(-1px);}
.gm-btn-remove{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;
  font-size:12.5px;font-weight:500;color:#fca5a5;
  background:transparent;border:1px solid rgba(239,68,68,.2);
  border-radius:var(--r-sm);cursor:pointer;font-family:var(--ff-display);margin-left:auto;
  transition:background var(--ease),border-color var(--ease),color var(--ease);}
.gm-btn-remove:hover{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.4);}
.gm-btn-remove:disabled{opacity:.4;cursor:not-allowed;}
.gm-btn-remove.shaking{animation:gm-shake .35s ease;}

/* spinner (inside remove btn) */
.gm-spin{display:inline-block;width:11px;height:11px;
  border:1.5px solid rgba(252,165,165,.25);border-top-color:#fca5a5;
  border-radius:50%;animation:gm-spin .7s linear infinite;}

/* card stagger */
.gm-card:nth-child(1){animation:gm-cardIn .5s .12s both;}
.gm-card:nth-child(2){animation:gm-cardIn .5s .20s both;}
.gm-card:nth-child(3){animation:gm-cardIn .5s .28s both;}
.gm-card:nth-child(4){animation:gm-cardIn .5s .36s both;}
.gm-card:nth-child(5){animation:gm-cardIn .5s .44s both;}
.gm-card:nth-child(6){animation:gm-cardIn .5s .52s both;}
.gm-card:nth-child(n+7){animation:gm-cardIn .5s .58s both;}

/* scrollbar */
.gm-root ::-webkit-scrollbar{width:6px;}
.gm-root ::-webkit-scrollbar-track{background:var(--bg-void);}
.gm-root ::-webkit-scrollbar-thumb{background:var(--bg-raised);border-radius:3px;}
.gm-root ::-webkit-scrollbar-thumb:hover{background:var(--blue-dim);}
::selection{background:rgba(37,99,235,.3);color:#e0f2fe;}
`;

/* ─── helpers ─── */
function fmt(n) { return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n); }
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── RepoCard ─── */
function RepoCard({ repo, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleRemove = () => {
    if (removing) return;
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
    setTimeout(() => {
      setRemoving(true);
      setTimeout(() => onRemove(repo.repo_name), 360);
    }, 200);
  };

  return (
    <div className={`gm-card${removing ? " removing" : ""}`}>
      {/* top */}
      <div className="gm-card-top">
        <span className={`gm-diff ${repo.difficulty}`}>{repo.difficulty}</span>
        <span className="gm-lang">{repo.language}</span>
      </div>

      {/* name */}
      <h3 className="gm-repo-name">
        <a href={repo.repo_url} target="_blank" rel="noopener noreferrer">
          {repo.repo_name}
        </a>
      </h3>

      {/* description */}
      <p className="gm-desc">{repo.description}</p>

      {/* stats */}
      <div className="gm-stats">
        <span className="gm-stat">
          <span className="gm-stat-icon">⭐</span>
          {fmt(repo.stars)}
        </span>
        <span className="gm-stat">
          <span className="gm-stat-icon">🐛</span>
          {repo.open_issues} issues
        </span>
        <span className="gm-saved-at">saved {fmtDate(repo.saved_at)}</span>
      </div>

      <hr className="gm-card-divider" />

      {/* actions */}
      <div className="gm-actions">
        <a href={repo.repo_url} target="_blank" rel="noopener noreferrer" className="gm-btn-github">
          View on GitHub ↗
        </a>
        <button
          type="button"
          className={`gm-btn-remove${shaking ? " shaking" : ""}`}
          onClick={handleRemove}
          disabled={removing}
          aria-label={`Remove ${repo.repo_name}`}
        >
          {removing ? <span className="gm-spin" /> : "Remove"}
        </button>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function Saved({
  initialSaved = MOCK_SAVED,
  error,
  onRemove,
}) {
  const [saved, setSaved] = useState(initialSaved);

  /* inject styles once */
  useEffect(() => {
    const id = "gm-saved-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = KEYFRAMES + CSS_VARS + STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const handleRemove = (repoName) => {
    setSaved((prev) => prev.filter((r) => r.repo_name !== repoName));
    if (onRemove) onRemove(repoName);
  };

  return (
    <div className="gm-root">
      {/* Nav */}
      <nav className="gm-nav">
        <span className="gm-brand">GitMatch</span>
        {["Discover", "Saved", "Profile", "Logout"].map((label) => (
          <button
            key={label}
            className={`gm-nav-link${label === "Saved" ? " active" : ""}`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="gm-container">
        {/* Header */}
        <div className="gm-header">
          <h2 className="gm-heading">Saved repos</h2>
          <span className="gm-count-badge">{saved.length} saved</span>
        </div>

        {/* Error */}
        {error && <p className="gm-error">⚠ {error}</p>}

        {/* Empty state */}
        {saved.length === 0 && !error && (
          <div className="gm-empty">
            <div className="gm-empty-icon">📭</div>
            <p className="gm-empty-text">Nothing saved yet.</p>
            <a href="/discover" className="gm-empty-link">Go discover repos →</a>
          </div>
        )}

        {/* Card grid */}
        {saved.length > 0 && (
          <div className="gm-grid">
            {saved.map((repo) => (
              <RepoCard key={repo.repo_name} repo={repo} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
