import { useState } from "react";
import "./login.css";

/**
 * LoginPage
 *
 * Props:
 *   error  {string}  — optional server-side error message to display
 *
 * Usage (server-rendered props via window.__PROPS__ or similar):
 *   <LoginPage error="Invalid GitHub username." />
 */
export default function LoginPage({ error = "" }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e) => {
    if (!username.trim()) { e.preventDefault(); return; }
    setLoading(true);
    // Let the native form POST to /login — no e.preventDefault()
  };

  return (
    <div className="center-wrap">

      {/* Brand */}
      <h1>GitMatch</h1>

      {/* Tagline */}
      <p>Find open source repos that match your skills</p>

      {/* Ornament divider */}
      <div className="ornament" />

      {/* Login card */}
      <div className="login-box">

        {error && (
          <p className="error" style={{ marginBottom: "14px" }}>{error}</p>
        )}

        <form action="/login" method="POST" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Your GitHub username"
            required
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            <span>{loading ? "Loading…" : "Let's go →"}</span>
          </button>
        </form>

      </div>

      {/* Footer note */}
      <p className="login-note">
        We only use your username to fetch public GitHub data.
      </p>

    </div>
  );
}
