const GROQ_KEYS = Object.keys(process.env)
  .filter((k) => k.startsWith("GROQ_API_KEY_"))
  .sort() // GROQ_API_KEY_1, _2, _3 … in order
  .map((k) => process.env[k])
  .filter(Boolean);

if (GROQ_KEYS.length === 0) {
  console.error(
    "[groqClient] No Groq API keys found. Add GROQ_API_KEY_1, GROQ_API_KEY_2, ... to your .env file."
  );
}

const keyState = {};

GROQ_KEYS.forEach((_, i) => {
  keyState[i] = { limited: false, resetAt: 0 };
});

// ── Pick the next available key ───────────────────────
function getAvailableKey() {
  const now = Date.now();

  // First: un-limit any keys whose reset window has passed
  GROQ_KEYS.forEach((_, i) => {
    if (keyState[i].limited && now >= keyState[i].resetAt) {
      keyState[i].limited = false;
      keyState[i].resetAt = 0;
      console.log(`[groqClient] Key #${i + 1} rate-limit window expired — available again.`);
    }
  });

  // Find the first available key
  const idx = GROQ_KEYS.findIndex((_, i) => !keyState[i].limited);
  if (idx === -1) return null; // all keys exhausted
  return { key: GROQ_KEYS[idx], index: idx };
}

// ── Mark a key as rate-limited ────────────────────────
// retryAfter: seconds until reset (from Groq's Retry-After header, or default 60s)
function markLimited(index, retryAfterSeconds = 60) {
  keyState[index].limited = true;
  keyState[index].resetAt = Date.now() + retryAfterSeconds * 1000;
  console.warn(
    `[groqClient] Key #${index + 1} hit rate limit. Will retry after ${retryAfterSeconds}s.`
  );
}

// ── Core function: call Groq with automatic key rotation ─
/**
 * callGroq({ model, messages, max_tokens, temperature })
 *
 * Tries each available key in order.
 * On 429 (rate limit) it marks that key limited and tries the next.
 * Throws if all keys are exhausted or a non-rate-limit error occurs.
 *
 * Returns the raw Groq response JSON.
 */
async function callGroq({ model = "llama-3.3-70b-versatile", messages, max_tokens = 1024, temperature = 0.7 }) {
  if (GROQ_KEYS.length === 0) {
    throw new Error("No Groq API keys configured.");
  }

  // Try every key until one works or all are exhausted
  for (let attempt = 0; attempt < GROQ_KEYS.length; attempt++) {
    const available = getAvailableKey();

    if (!available) {
      throw new Error(
        "All Groq API keys are currently rate-limited. Please wait a moment and try again."
      );
    }

    const { key, index } = available;

    console.log(`[groqClient] Using key #${index + 1} (attempt ${attempt + 1}/${GROQ_KEYS.length})`);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({ model, messages, max_tokens, temperature }),
      });

      // ── Rate limit hit ────────────────────────────────
      if (response.status === 429) {
        // Groq sends Retry-After in seconds (or x-ratelimit-reset-requests as epoch)
        const retryAfter = parseInt(response.headers.get("retry-after") || "60", 10);
        markLimited(index, retryAfter);
        // Loop to try next key
        continue;
      }

      // ── Auth error — bad key, skip it permanently this session ─
      if (response.status === 401 || response.status === 403) {
        console.error(`[groqClient] Key #${index + 1} is invalid (${response.status}). Disabling.`);
        markLimited(index, 86400); // disable for 24h
        continue;
      }

      // ── Other HTTP error ──────────────────────────────
      if (!response.ok) {
        const body = await response.text();
        console.error(`[groqClient] Key #${index + 1} error ${response.status}:`, body);
        throw new Error(`Groq API error ${response.status}: ${body}`);
      }

      // ── Success ───────────────────────────────────────
      const data = await response.json();
      console.log(`[groqClient] Key #${index + 1} succeeded.`);
      return data;

    } catch (err) {
      // Network-level error (not an HTTP status) — rethrow immediately
      if (err.message.startsWith("Groq API error") || err.message.startsWith("All Groq")) {
        throw err;
      }
      console.error(`[groqClient] Network error with key #${index + 1}:`, err.message);
      throw err;
    }
  }

  throw new Error("All Groq API keys failed. Please check your configuration.");
}

// ── Status helper (optional, useful for debugging) ───
function getKeyStatus() {
  return GROQ_KEYS.map((_, i) => ({
    key: `Key #${i + 1}`,
    limited: keyState[i].limited,
    resetsIn: keyState[i].limited
      ? Math.max(0, Math.ceil((keyState[i].resetAt - Date.now()) / 1000)) + "s"
      : "—",
  }));
}

module.exports = { callGroq, getKeyStatus };
