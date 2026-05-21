# GitMatch

> Discover open source issues worth contributing to — matched to your actual skills.

GitMatch connects with your GitHub account and turns your profile into a personalized contribution roadmap. It reads what you've built, detects skills you likely have, and recommends real open source issues where your skills are needed — with AI-powered breakdowns to help you get started fast.

---

## Status

🚧 **Active development** — core features are working. Filters and difficulty scoring in progress.

---

## Features

- **GitHub OAuth login** — sign in with your GitHub account, no manual setup needed
- **Profile overview** — fetches your GitHub profile, stats, and Languages
- **Skills picker** — detects languages and frameworks from your repos; lets you add or remove skills
- **Issue recommendations** — matches real open source issues to your selected skills
- **AI breakdown** — click "View More Details" on any saved issue to get an AI-generated debrief, tech stack, prerequisites, and step-by-step contribution guide
- **Save for later** — bookmark issues you want to revisit
- **Direct links** — open any issue or repository straight from the app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express |
| Templating | EJS |
| Database | MongoDB |
| Auth | GitHub OAuth2 (Passport.js) |
| AI | Groq API (LLaMA 3.3 70B) |
| Caching | MongoDB (GitHub API + AI breakdowns) |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally or a connection string
- GitHub OAuth App (Client ID + Secret)
- Groq API key

### Installation

```bash
git clone https://github.com/your-username/gitmatch.git
cd gitmatch
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

GROQ_API_KEY=your_groq_api_key
```

### GitHub OAuth Setup

1. Go to **GitHub → Settings → Developer Settings → OAuth Apps**
2. Click **New OAuth App**
3. Set the callback URL to `http://localhost:3000/auth/github/callback`
4. Copy the Client ID and Secret into your `.env`

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

1. Sign in with your GitHub account via OAuth
2. GitMatch fetches your profile, repos, and stats via the GitHub API
3. It detects languages and frameworks you've used
4. You confirm or expand your skill set using the skills picker
5. GitMatch returns a curated list of open source issues matched to your skills
6. Click **View More Details** on any saved issue to get an AI-powered breakdown
7. Save issues you like and open them directly on GitHub

---

## Roadmap

- [x] GitHub OAuth2 login
- [x] GitHub profile and stats display
- [x] Skills detection and manual picker
- [x] Issue recommendations matched to skills
- [x] AI-powered issue breakdown (Groq + LLaMA 3.3)
- [x] Save issues for later
- [x] MongoDB caching for GitHub API responses
- [x] MongoDB caching for AI generated breakdowns
- [ ] Filter recommendations by language, difficulty, or topic
- [ ] Difficulty tags per issue (Beginner, Intermediate, Hard)
- [ ] Repository freshness indicator (last commit, open issues count)

---

## Contributing

This project is in active development. Issues and pull requests are welcome. Check back soon.

---

## License

MIT