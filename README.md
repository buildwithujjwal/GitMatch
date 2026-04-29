# GitMatch

> Discover open source repositories worth contributing to — matched to your actual skills.

GitMatch takes your GitHub username and turns your profile into a personalized contribution roadmap. It reads what you've built, surfaces skills you likely have, and recommends real repositories where your skills are needed — filtered by difficulty so you can start at your level.

---

## Status

🚧 **Active development** — core features are working. Caching layer and contribution difficulty scoring in progress.

---

## Features

- **Profile overview** — fetches your GitHub profile, stats, and contribution history
- **Achievement display** — highlights your activity and repository milestones
- **Skills picker** — detects languages and frameworks from your repos; lets you add more
- **Repo recommendations** — matches open source repositories to your selected skills
- **Difficulty tags** — each recommended repo is labeled Beginner, Intermediate, or Hard
- **Save for later** — bookmark repositories you want to revisit
- **Direct links** — open any repository straight from the app to start contributing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express |
| Templating | EJS |
| Database | MongoDB |
| Caching | In progress |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally or a connection string

### Installation

```bash
git clone https://github.com/your-username/gitmatch.git
cd gitmatch
npm install
```


### Run

```bash
# Development
npm run dev

# Production
npm start
```

Open `http://localhost:3000` in your browser.

---

## How It Works

1. Enter your GitHub username on the home page
2. GitMatch fetches your profile, repos, and stats via the GitHub API
3. It detects languages and frameworks you've used
4. You confirm or expand your skill set using the skills picker
5. GitMatch returns a curated list of repositories to contribute to, sorted by relevance and difficulty
6. Save the ones you like and open them directly on GitHub

---

## Roadmap

- [x] GitHub profile and stats display
- [x] Achievements section
- [x] Skills detection and manual picker
- [x] Repository recommendations with difficulty tags
- [x] Save repositories for later
- [x] MongoDB integration
- [ ] Caching layer for GitHub API responses
- [ ] Filter recommendations by language, difficulty, or topic
- [ ] User accounts and persistent saved repos
- [ ] Repository freshness indicator (last commit, open issues count)

---

## Contributing

This project is in active development. Issues and pull requests are welcome once the caching layer is stable. Check back soon.

---

## License

MIT