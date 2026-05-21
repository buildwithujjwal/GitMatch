const express = require("express");
const router = express.Router();
const SavedRepo = require("../models/SavedRepo");
const { callGroq } = require("./groqClient");
const GeneratedBreakdown = require("../models/BreakdownCache"); // ✅ fixed

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// Save an issue
router.post("/save", requireLogin, async (req, res) => {
  const {
    repo_name,
    repo_url,
    description,
    stars,
    language,
    issue_title,
    issue_url,
    issue_number,
  } = req.body;
  const username = req.session.user.username;

  try {
    await SavedRepo.create({
      username,
      repo_name,
      repo_url,
      description,
      stars: parseInt(stars),
      language,
      issue_title,
      issue_url,
      issue_number: parseInt(issue_number),
    });
  } catch (err) {
    if (err.code !== 11000) console.error("Save error:", err.message);
  }

  const referer = req.get("Referer") || "/discover";
  res.redirect(referer);
});

// Remove a saved issue
router.post("/remove", requireLogin, async (req, res) => {
  const { id } = req.body;
  const username = req.session.user.username;

  try {
    await SavedRepo.deleteOne({ _id: id, username });
  } catch (err) {
    console.error("Remove error:", err.message);
  }

  res.redirect("/saved");
});

// Saved issues page
router.get("/saved", requireLogin, async (req, res) => {
  const username = req.session.user.username;

  try {
    const saved = await SavedRepo.find({ username }).sort({ saved_at: -1 });
    res.render("saved", {
      title: "Saved",
      showNav: true,
      page: "saved",
      user: req.session.user,
      saved,
    });
  } catch (err) {
    console.error("Fetch saved error:", err.message);
    res.render("saved", {
      title: "Saved",
      showNav: true,
      page: "saved",
      user: req.session.user,
      saved: [],
      error: "Could not load saved issues",
    });
  }
});

// AI Breakdown endpoint
router.post("/api/breakdown", requireLogin, async (req, res) => {
  const {
    issue_title,
    repo_name,
    language,
    description,
    labels,
    issue_number,
    issue_url, // ✅ added
  } = req.body;

  if (!issue_title || !repo_name) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // check cache first
  if (issue_url) {
    const cached = await GeneratedBreakdown.findOne({ issue_url }); // ✅ fixed
    if (cached) {
      console.log("Breakdown cache hit:", issue_url);
      return res.json({
        ok: true,
        breakdown: cached.breakdown,
        fromCache: true,
      });
    }
  }

  const prompt = `You are a helpful open source contribution guide. Analyze this GitHub issue and provide a structured breakdown for a developer who wants to contribute.

Issue Title: ${issue_title}
Repository: ${repo_name}
Language: ${language || "Unknown"}
Description: ${description || "No description provided."}
Labels: ${labels || "None"}
Issue Number: #${issue_number || "N/A"}

Respond in EXACTLY this format. Use the ALL-CAPS section headers as shown. Do not add any extra text before or after:

DEBRIEF:
[2–3 sentences explaining what this issue asks for and why it matters to the project]

REPOSITORY INSIGHTS:
Badges: [comma-separated list of any that apply: Easy Setup, Good Contributing Guide, Beginner Friendly]
Tech Stack: [main technologies involved]
Prerequisites: [what the contributor should know or have installed]

HOW TO TACKLE:
1. [Step one — specific and actionable, 1–2 sentences]
2. [Step two]
3. [Step three]
4. [Step four]
5. [Step five]`;

  try {
    const data = await callGroq({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const text = data.choices?.[0]?.message?.content || "";

    if (!text) {
      return res
        .status(502)
        .json({ error: "AI returned an empty response. Please try again." });
    }

    const parsed = parseBreakdown(text);

    // save to database
    if (issue_url) {
      try {
        await GeneratedBreakdown.create({
          // ✅ fixed
          issue_url,
          breakdown: parsed,
          issue_title,
          repo_name,
        });
        console.log("Breakdown saved:", issue_url);
      } catch (cacheErr) {
        console.error("Save error:", cacheErr.message);
      }
    }

    res.json({ ok: true, breakdown: parsed, raw: text });
  } catch (err) {
    console.error("Breakdown error:", err.message);
    if (err.message.includes("rate-limited")) {
      return res
        .status(429)
        .json({
          error:
            "All AI keys are rate-limited. Please wait a moment and try again.",
        });
    }
    res
      .status(500)
      .json({ error: "Failed to generate breakdown. Please try again." });
  }
}); // ✅ fixed syntax error

function parseBreakdown(text) {
  const result = {
    debrief: "",
    badges: [],
    techStack: "",
    prerequisites: "",
    steps: [],
  };

  try {
    const debriefMatch = text.match(
      /DEBRIEF:\s*([\s\S]*?)(?=\nREPOSITORY INSIGHTS:|$)/i,
    );
    if (debriefMatch) result.debrief = debriefMatch[1].trim();

    const insightsMatch = text.match(
      /REPOSITORY INSIGHTS:\s*([\s\S]*?)(?=\nHOW TO TACKLE:|$)/i,
    );
    if (insightsMatch) {
      const raw = insightsMatch[1];

      const badgesMatch = raw.match(/Badges:\s*([^\n]+)/i);
      if (badgesMatch) {
        result.badges = badgesMatch[1]
          .split(",")
          .map((b) => b.trim())
          .filter(
            (b) => b && b.toLowerCase() !== "none" && b.toLowerCase() !== "n/a",
          );
      }

      const techMatch = raw.match(/Tech Stack:\s*([^\n]+)/i);
      if (techMatch) result.techStack = techMatch[1].trim();

      const prereqMatch = raw.match(/Prerequisites:\s*([^\n]+)/i);
      if (prereqMatch) result.prerequisites = prereqMatch[1].trim();
    }

    const tackleMatch = text.match(/HOW TO TACKLE:\s*([\s\S]*?)$/i);
    if (tackleMatch) {
      const lines = tackleMatch[1].trim().split("\n");
      result.steps = lines
        .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter(Boolean);
    }
  } catch (e) {
    console.error("Parse error:", e.message);
  }

  return result;
}

module.exports = router;
