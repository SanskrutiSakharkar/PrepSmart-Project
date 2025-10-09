// server/utils/judge0.js
const axios = require('axios');

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.JUDGE0_KEY;

const languageMap = {
  python: 71,      // Python 3
  react: 63,       // Node.js (for JS/React code)
  javascript: 63,  // For plain JS
  mysql: 82,       // MySQL (alias for legacy)
  sql: 82          // MySQL (for your "sql" key)
};

async function runJudge0({ source_code, language, stdin = "", expected_output = "" }) {
  const language_id = languageMap[language] || 71;
  const { data } = await axios.post(
    `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
    {
      source_code,
      language_id,
      stdin,
      expected_output
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": JUDGE0_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      }
    }
  );
  return data;
}

module.exports = { runJudge0 };
