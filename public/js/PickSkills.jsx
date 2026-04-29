import { useState, useEffect, useRef } from "react";

/* ─── Static data (replace with props / API in prod) ─── */
const USER_LANGS = ["TypeScript", "Python", "Go"];

const SKILLS = {
  languages: [
    "JavaScript","TypeScript","Python","Rust","Go","Java","C++","C#",
    "Ruby","PHP","Swift","Kotlin","Scala","Haskell","Elixir","Dart",
    "Lua","Zig","R","Julia",
  ],
  frameworks: [
    "React","Next.js","Vue","Nuxt","Svelte","SvelteKit","Angular",
    "Express","Fastify","NestJS","Django","FastAPI","Flask","Rails",
    "Spring","Laravel","Phoenix","Actix","Axum","Gin","Echo",
    "GraphQL","tRPC","Prisma","Drizzle","Tailwind","Docker","Kubernetes",
  ],
};

/* ─── Animations (keyframes injected once) ─── */
const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@keyframes gm-fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes gm-slideDown {
  from { transform: translateY(-56px); opacity: 0; }
  to   { transform: translateY(0);      opacity: 1; }
}
@keyframes gm-breathe {
  0%,100% { opacity: .6; transform: scale(1); }
  50%     { opacity: 1;  transform: scale(1.05); }
}
@keyframes gm-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.12); }
  100% { transform: scale(1); }
}
@keyframes gm-pulse-ring {
  0%   { box-shadow: 0 0 0 0   rgba(59,130,246,.35); }
  70%  { box-shadow: 0 0 0 6px rgba(59,130,246,0);   }
  100% { box-shadow: 0 0 0 0   rgba(59,130,246,0);   }
}
`;

/* ─── CSS variables (scoped) ─── */
const CSS_VARS = `
.gm-root {
  --bg-void:       #080c12;
  --bg-deep:       #0d1320;
  --bg-surface:    #111827;
  --bg-raised:     #162032;
  --bg-hover:      #1c2a40;
  --border-subtle: rgba(56,100,160,.18);
  --border-mid:    rgba(56,120,200,.30);
  --border-glow:   rgba(82,150,255,.55);
  --blue-dim:      #1e3a5f;
  --blue-mid:      #2563eb;
  --blue-bright:   #3b82f6;
  --blue-glow:     rgba(59,130,246,.15);
  --blue-text:     #93c5fd;
  --text-primary:  #e2e8f0;
  --text-secondary:#8b9cbb;
  --text-muted:    #4a5a72;
  --ff-display: 'DM Sans', 'Segoe UI', sans-serif;
  --ff-mono:    'JetBrains Mono', 'Fira Code', monospace;
  --r-sm: 6px; --r-md: 10px; --r-lg: 16px;
  --ease: 200ms cubic-bezier(.4,0,.2,1);
  --spring: 350ms cubic-bezier(.34,1.56,.64,1);
}
`;

const COMPONENT_STYLES = `
.gm-root {
  font-family: var(--ff-display);
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-void);
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}
.gm-root * { box-sizing: border-box; margin: 0; padding: 0; }
.gm-root::before {
  content: '';
  position: fixed; top: -20%; left: -10%;
  width: 60%; height: 60%;
  background: radial-gradient(ellipse, rgba(37,99,235,.07) 0%, transparent 65%);
  pointer-events: none; z-index: 0;
  animation: gm-breathe 8s ease-in-out infinite;
}
.gm-root::after {
  content: '';
  position: fixed; bottom: -10%; right: -5%;
  width: 50%; height: 50%;
  background: radial-gradient(ellipse, rgba(15,50,120,.06) 0%, transparent 65%);
  pointer-events: none; z-index: 0;
}

/* nav */
.gm-nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; gap: 4px;
  padding: 0 24px; height: 56px;
  background: rgba(8,12,18,.85);
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(12px);
  animation: gm-slideDown .5s var(--spring);
}
.gm-brand {
  font-family: var(--ff-mono);
  font-size: 15px; font-weight: 500;
  color: var(--blue-bright);
  letter-spacing: -.01em;
  margin-right: auto;
}
.gm-brand::before { content: '> '; color: var(--text-muted); font-size: 13px; }
.gm-nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px; font-weight: 400;
  padding: 6px 12px;
  border-radius: var(--r-sm);
  transition: color var(--ease), background var(--ease);
  cursor: pointer; background: transparent; border: none;
  letter-spacing: .01em;
}
.gm-nav-link:hover { color: var(--text-primary); background: var(--bg-hover); }

/* container */
.gm-container {
  position: relative; z-index: 1;
  max-width: 740px; margin: 0 auto;
  padding: 52px 24px 80px;
}

/* heading */
.gm-heading {
  font-size: 26px; font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -.03em; line-height: 1.2;
  animation: gm-fadeUp .6s .1s both;
}
.gm-subtitle {
  color: var(--text-secondary);
  font-size: 14px; margin-top: 6px; margin-bottom: 40px;
  animation: gm-fadeUp .6s .18s both;
}

/* count badge */
.gm-count {
  display: inline-block;
  font-family: var(--ff-mono); font-size: 11px;
  color: var(--blue-text);
  background: rgba(37,99,235,.15);
  border: 1px solid rgba(59,130,246,.3);
  padding: 2px 8px; border-radius: 20px;
  margin-left: 10px; vertical-align: middle;
  transition: all var(--ease);
}

/* sections */
.gm-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--r-lg);
  padding: 24px; margin-bottom: 16px;
  transition: border-color var(--ease);
}
.gm-section:hover { border-color: var(--border-mid); }
.gm-section.github {
  border-color: var(--blue-dim);
  background: linear-gradient(135deg, rgba(30,58,95,.18) 0%, var(--bg-surface) 60%);
  position: relative; overflow: hidden;
}
.gm-section.github::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at top left, rgba(59,130,246,.08) 0%, transparent 60%);
  pointer-events: none;
}
.gm-section-title {
  font-size: 11px; font-weight: 500;
  letter-spacing: .1em; text-transform: uppercase;
  color: var(--text-muted); margin-bottom: 14px;
  display: flex; align-items: center; gap: 8px;
}
.gm-section-title-badge {
  font-size: 10px; letter-spacing: .05em;
  color: var(--blue-text);
  background: rgba(37,99,235,.15);
  border: 1px solid rgba(59,130,246,.25);
  padding: 1px 7px; border-radius: 10px;
  text-transform: none; font-weight: 400;
}

/* tag list */
.gm-tags { display: flex; flex-wrap: wrap; gap: 8px; }

/* skill tag */
.gm-tag {
  display: inline-block;
  padding: 5px 13px; font-size: 12.5px; font-weight: 400;
  font-family: var(--ff-mono);
  color: var(--text-secondary);
  background: var(--bg-raised);
  border: 1px solid var(--border-subtle);
  border-radius: var(--r-sm);
  cursor: pointer; user-select: none;
  transition:
    color var(--ease),
    background var(--ease),
    border-color var(--ease),
    transform 150ms ease,
    box-shadow var(--ease);
}
.gm-tag:hover {
  color: var(--blue-text);
  background: var(--bg-hover);
  border-color: var(--border-mid);
  transform: translateY(-1px);
}
.gm-tag.selected {
  color: #bfdbfe;
  background: rgba(37,99,235,.14);
  border-color: rgba(59,130,246,.5);
  box-shadow: 0 0 0 1px rgba(59,130,246,.2), 0 2px 8px rgba(37,99,235,.1);
  animation: gm-pop .35s var(--spring);
}
.gm-tag.selected::before {
  content: '✓ '; font-size: 10px; opacity: .7;
}
.gm-tag:focus-visible {
  outline: 2px solid var(--blue-bright); outline-offset: 2px;
}

/* submit */
.gm-submit {
  display: inline-flex; align-items: center; gap: 8px;
  margin-top: 12px; padding: 11px 28px;
  font-family: var(--ff-display); font-size: 14px; font-weight: 500;
  color: #dbeafe;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  border: 1px solid rgba(96,165,250,.35);
  border-radius: var(--r-md);
  cursor: pointer; letter-spacing: .01em;
  position: relative; overflow: hidden;
  transition: transform var(--ease), box-shadow var(--ease), filter var(--ease);
}
.gm-submit::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 60%);
  pointer-events: none;
}
.gm-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(37,99,235,.35);
  filter: brightness(1.08);
}
.gm-submit:active { transform: translateY(0); filter: brightness(.97); }
.gm-submit:disabled {
  opacity: .45; cursor: not-allowed; filter: none;
  transform: none; box-shadow: none;
}
.gm-submit.pulse { animation: gm-pulse-ring .5s ease; }

/* divider */
.gm-divider {
  border: none; border-top: 1px solid var(--border-subtle);
  margin: 28px 0;
}

/* stagger in */
.gm-s0 { animation: gm-fadeUp .55s .12s both; }
.gm-s1 { animation: gm-fadeUp .55s .22s both; }
.gm-s2 { animation: gm-fadeUp .55s .32s both; }
.gm-s3 { animation: gm-fadeUp .55s .42s both; }

/* scrollbar */
.gm-root ::-webkit-scrollbar { width: 6px; }
.gm-root ::-webkit-scrollbar-track { background: var(--bg-void); }
.gm-root ::-webkit-scrollbar-thumb { background: var(--bg-raised); border-radius: 3px; }
.gm-root ::-webkit-scrollbar-thumb:hover { background: var(--blue-dim); }
::selection { background: rgba(37,99,235,.3); color: #e0f2fe; }
`;

/* ─── SkillTag ─── */
function SkillTag({ name, checked, onToggle }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onToggle(name)}
      className={`gm-tag${checked ? " selected" : ""}`}
    >
      {checked ? "✓ " : ""}{name}
    </button>
  );
}

/* ─── Section ─── */
function Section({ title, badge, skills, selected, onToggle, className = "", stagger = "gm-s1" }) {
  return (
    <div className={`gm-section ${className} ${stagger}`}>
      <div className="gm-section-title">
        {title}
        {badge && <span className="gm-section-title-badge">{badge}</span>}
      </div>
      <div className="gm-tags">
        {skills.map((s) => (
          <SkillTag key={s} name={s} checked={selected.includes(s)} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export default function PickSkills({
  userLangs = USER_LANGS,
  skills = SKILLS,
  initialSelected = [],
  onSubmit,
}) {
  const [selected, setSelected] = useState(() =>
    initialSelected.length ? initialSelected : userLangs.slice(0, 2)
  );
  const [pulsing, setPulsing] = useState(false);
  const submitRef = useRef(null);

  /* inject styles once */
  useEffect(() => {
    const id = "gm-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = KEYFRAMES + CSS_VARS + COMPONENT_STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const toggle = (skill) =>
    setSelected((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected.length) return;
    setPulsing(true);
    setTimeout(() => setPulsing(false), 600);
    if (onSubmit) onSubmit(selected);
    else console.log("Selected skills →", selected);
  };

  /* filter out user langs from the main language list to avoid duplicates */
  const filteredLangs = skills.languages.filter((l) => !userLangs.includes(l));

  return (
    <div className="gm-root">
      {/* Nav */}
      <nav className="gm-nav">
        <span className="gm-brand">GitMatch</span>
        {["Discover", "Saved", "Profile", "Logout"].map((label) => (
          <button key={label} className="gm-nav-link">{label}</button>
        ))}
      </nav>

      {/* Main */}
      <main className="gm-container">
        <h2 className="gm-heading">
          Pick your skills
          {selected.length > 0 && (
            <span className="gm-count">{selected.length} selected</span>
          )}
        </h2>
        <p className="gm-subtitle">
          Select languages and tools — we'll find repos with open issues that match.
        </p>

        <form onSubmit={handleSubmit}>
          {/* From GitHub */}
          {userLangs.length > 0 && (
            <Section
              title="From your GitHub"
              badge="auto-detected"
              skills={userLangs}
              selected={selected}
              onToggle={toggle}
              className="github"
              stagger="gm-s0"
            />
          )}

          {/* Languages */}
          <Section
            title="Languages"
            skills={filteredLangs}
            selected={selected}
            onToggle={toggle}
            stagger="gm-s1"
          />

          {/* Frameworks */}
          <Section
            title="Frameworks &amp; Tools"
            skills={skills.frameworks}
            selected={selected}
            onToggle={toggle}
            stagger="gm-s2"
          />

          <div className="gm-s3">
            <button
              type="submit"
              className={`gm-submit${pulsing ? " pulse" : ""}`}
              disabled={selected.length === 0}
              ref={submitRef}
            >
              Find repos →
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
