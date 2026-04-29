import React, { useEffect, useState } from "react";
import "./Profile.css"; // Use the same CSS above

const Profile = ({ user }) => {
  const [langs, setLangs] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    if (user?.languages) {
      const sortedLangs = Object.entries(user.languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
      setLangs(sortedLangs);
    }

    if (user?.topics) {
      const sortedTopics = Object.entries(user.topics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([topic]) => topic);
      setTopics(sortedTopics);
    }
  }, [user]);

  return (
    <>
      <nav>
        <span className="brand">GitMatch</span>
        <a href="/discover">Discover</a>
        <a href="/saved">Saved</a>
        <a href="/profile" className="active">
          Profile
        </a>
        <a href="/logout" className="logout">
          Logout
        </a>
      </nav>

      <div className="container">
        <div className="profile-card">
          <img src={user.avatar} alt={user.username} className="avatar" />
          <div className="profile-info">
            <h2>{user.name}</h2>
            <p className="username">@{user.username}</p>
            {user.bio && <p className="bio">{user.bio}</p>}
            {user.location && <p className="meta">📍 {user.location}</p>}

            <div className="stats">
              <span>
                <strong>{user.public_repos}</strong> repos
              </span>
              <span>
                <strong>{user.followers}</strong> followers
              </span>
              <span>
                <strong>{user.following}</strong> following
              </span>
            </div>
          </div>
        </div>

        {langs.length > 0 && (
          <div className="section">
            <h3>Your languages</h3>
            <div className="tag-list">
              {langs.map(([lang, count], index) => (
                <span key={index} className="tag">
                  {lang} <span className="tag-count">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {topics.length > 0 && (
          <div className="section">
            <h3>Your topics</h3>
            <div className="tag-list">
              {topics.map((topic, index) => (
                <span key={index} className="tag">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        <a href="/skills" className="btn">
          Pick skills &amp; discover repos →
        </a>
      </div>
    </>
  );
};

export default Profile;
