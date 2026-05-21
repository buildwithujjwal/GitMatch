const axios = require("axios");
const Cache = require("../models/Cache");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// skill mapping

const LANGUAGE_MAP = {
  "HTML/CSS": "HTML",
  "Node.js": "JavaScript",
  ".NET": "C#",
};

const TOPIC_SKILLS = new Set([
  "React",
  "Vue",
  "Angular",
  "Next.js",
  "Django",
  "Flask",
  "FastAPI",
  "Spring",
  "Laravel",
  "Flutter",
  "TensorFlow",
  "PyTorch",
  "Docker",
  "Kubernetes",
]);

// build github search query

function buildIssueQuery(skills = []) {
  return [
    ...skills.map((skill) =>
      TOPIC_SKILLS.has(skill)
        ? `topic:${skill.toLowerCase()}`
        : `language:${LANGUAGE_MAP[skill] || skill}`,
    ),
    "is:open",
    "is:issue",
    'label:"good first issue"',
    "sort:updated",
  ].join(" ");
}

// format github issue response

function formatIssue(issue) {
  const repo = issue.repository;

  if (!repo?.nameWithOwner) return null;

  const totalSize = repo.languages?.totalSize || 0;

  const languageBreakdown = {};
  const validTags = [];

  for (const { size, node } of repo.languages?.edges || []) {
    const percentage = Number(((size / totalSize) * 100).toFixed(2));

    languageBreakdown[node.name] = percentage;

    if (percentage >= 10) {
      validTags.push(node.name);
    }
  }

  return {
    id: issue.id,
    title: issue.title,
    url: issue.url,
    number: issue.number,
    state: issue.state,

    body:
      issue.bodyText?.length > 500
        ? `${issue.bodyText.slice(0, 500)}...`
        : issue.bodyText || "",

    comments: issue.comments?.totalCount || 0,
    labels: issue.labels?.nodes?.map((l) => l.name) || [],
    createdAt: issue.createdAt,

    repo_name: repo.nameWithOwner,
    repo_url: repo.url,
    repo_stars: repo.stargazerCount || 0,
    repo_description: repo.description || "No description",

    language: repo.primaryLanguage?.name || "Unknown",
    languageBreakdown,
    validTags,
  };
}

// fetch github issues via graphql

async function graphqlSearchIssues(skillQuery, userToken) {
  const cacheKey = `graphql__${skillQuery}`;

  const cached = await Cache.findOne({ query: cacheKey });

  if (cached) return cached.results;

  const query = `
    query($query: String!, $first: Int!, $after: String) {
      search(query: $query, type: ISSUE, first: $first, after: $after) {
        issueCount

        pageInfo {
          hasNextPage
          endCursor
        }

        nodes {
          ... on Issue {
            id
            title
            url
            number
            state
            bodyText
            createdAt

            comments {
              totalCount
            }

            labels(first: 10) {
              nodes { name }
            }

            repository {
              nameWithOwner
              stargazerCount
              description
              url

              primaryLanguage {
                name
              }

              languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
                totalSize

                edges {
                  size
                  node { name }
                }
              }
            }
          }
        }
      }
    }
  `;

  let results = [];
  let after = null;
  let hasNextPage = true;

  while (hasNextPage && results.length < 50) {
    const { data } = await axios.post(
      "https://api.github.com/graphql",
      {
        query,
        variables: {
          query: skillQuery,
          first: 25,
          after,
        },
      },
      {
        headers: {
          Authorization: `token ${userToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const search = data?.data?.search;

    if (!search) {
      throw new Error("Invalid GitHub GraphQL response");
    }

    hasNextPage = search.pageInfo.hasNextPage;
    after = search.pageInfo.endCursor;

    results.push(...search.nodes.map(formatIssue).filter(Boolean));
  }

  console.log(`Fetched ${results.length} issues`);

  await Cache.create({
    query: cacheKey,
    results,
    has_more: false,
  });

  return results;
}

// controllers

const showDiscover = async (req, res) => {
  const selected = req.session.selectedSkills || [];

  if (!selected.length) {
    return res.redirect("/skills");
  }

  const userToken = req.session.githubToken;

  try {
    const skillQuery = buildIssueQuery(selected);

    console.log("GitHub Query:", skillQuery);

    const repos = await graphqlSearchIssues(skillQuery, userToken);

    res.render("discover", {
      title: "Discover",
      showNav: true,
      page: "discover",
      user: req.session.user,
      selected,
      repos,
    });
  } catch (err) {
    console.error("Discover error:", err.message);

    res.render("discover", {
      title: "Discover",
      showNav: true,
      page: "discover",
      user: req.session.user,
      selected,
      repos: [],
      error: "Failed to fetch repositories. Please try again later.",
    });
  }
};

const getRateLimit = async (req, res) => {
  try {
    const { data } = await axios.get("https://api.github.com/rate_limit", {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    const graphql = data.resources.graphql;

    res.json({
      used: graphql.used,
      remaining: graphql.remaining,
      limit: graphql.limit,
      resetsAt: new Date(graphql.reset * 1000).toLocaleTimeString(),
    });
  } catch {
    res.status(500).json({
      error: "Failed to fetch rate limit",
    });
  }
};

module.exports = { showDiscover, getRateLimit };
