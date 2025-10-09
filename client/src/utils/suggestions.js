// utils/suggestions.js

/**
 * Analyze resume and job description text, returning:
 * - suggestions: Actionable feedback lines (array of string)
 * - missing: Important keywords in JD but NOT in resume (array)
 * - overlap: JD keywords present in resume (array)
 */
export function getPersonalizedResumeSuggestions(resumeText, jdText) {
  // Normalize and tokenize both texts
  const resumeWords = new Set(resumeText.toLowerCase().split(/\W+/));
  const jdWords = jdText.toLowerCase().split(/\W+/);

  // 1. JD keywords NOT in resume (ignore words <= 3 chars, deduped)
  const missing = [...new Set(jdWords.filter(word =>
    word.length > 3 && !resumeWords.has(word)
  ))];

  // 2. Overlapping keywords (present in both, ignore <= 3 chars, deduped)
  const overlap = [...new Set(jdWords.filter(word =>
    word.length > 3 && resumeWords.has(word)
  ))];

  // 3. Suggestions
  let suggestions = [];

  // Coverage feedback
  if (overlap.length > 15) {
    suggestions.push("Excellent coverage! Your resume contains many important keywords from the job description.");
  } else if (overlap.length > 6) {
    suggestions.push("Good start! Your resume matches several key terms, but you can still add more specific skills from the job description.");
  } else if (overlap.length > 0) {
    suggestions.push("Your resume includes a few relevant keywords, but it's missing many important terms from the job description.");
  } else {
    suggestions.push("Your resume doesn't match many keywords from the job description. Consider revising it to include more relevant skills.");
  }

  // Show missing keywords (top 8) as a text line
  if (missing.length > 0) {
    suggestions.push(`Consider adding these skills or keywords: ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? ', ...' : ''}`);
  } else {
    suggestions.push("Great! All important skills from the job description are mentioned in your resume.");
  }

  // Resume structure/section advice (demo rules)
  if (!/project/i.test(resumeText)) {
    suggestions.push("Tip: Add a 'Projects' section if you have relevant projects.");
  }
  if (!/experience/i.test(resumeText)) {
    suggestions.push("Tip: Make sure to highlight your 'Work Experience' section.");
  }
  if (!/education/i.test(resumeText)) {
    suggestions.push("Tip: Include an 'Education' section for academic qualifications.");
  }
  if (!/certificat/i.test(resumeText)) {
    suggestions.push("Tip: Mention relevant certifications, if any.");
  }

  // Remove duplicate suggestions, just in case
  suggestions = [...new Set(suggestions)];

  // Return in the format your UI expects
  return { suggestions, missing, overlap };
}

/**
 * Analyze a behavioral answer for STAR technique completeness.
 * Returns an array of suggestions.
 */
export function getPersonalizedBehavioralSuggestions(answer) {
  let suggestions = [];
  if (!/situation|context/i.test(answer)) {
    suggestions.push("Describe the situation or context clearly at the start.");
  }
  if (!/task|responsib/i.test(answer)) {
    suggestions.push("Explain your role or task in the story.");
  }
  if (!/action|initiative|approach|how/i.test(answer)) {
    suggestions.push("Describe the specific actions you took.");
  }
  if (!/result|outcome|impact|effect/i.test(answer)) {
    suggestions.push("Share the result or impact of your actions.");
  }
  if ((answer.match(/\bI\b/gi) || []).length < 2) {
    suggestions.push("Use more 'I' statements to show your personal contribution.");
  }
  if (answer.length < 120) {
    suggestions.push("Provide a bit more detail for a complete answer.");
  }
  if (suggestions.length === 0) suggestions.push("Well done! Your answer follows the STAR structure.");
  return suggestions;
}

/**
 * Analyze voice/tone feedback and suggest improvements.
 * @param {object} feedback - { energy, emotion, pitch, tempo, filler_words }
 * @returns {array} Array of string suggestions.
 */
export function getPersonalizedVoiceSuggestions(feedback) {
  const sug = [];
  if (feedback.energy && feedback.energy === "low") {
    sug.push("Speak with more energy and enthusiasm to sound more confident.");
  }
  if (feedback.emotion && /nervous|negative|flat|sad/.test(feedback.emotion)) {
    sug.push("Try to sound positive and upbeat for a better impression.");
  }
  if (feedback.pitch && /monotone|flat/.test(feedback.pitch)) {
    sug.push("Vary your pitch to sound more engaging.");
  }
  if (feedback.tempo && feedback.tempo === "fast") {
    sug.push("Slow down a bit to ensure clarity.");
  }
  if (feedback.tempo && feedback.tempo === "slow") {
    sug.push("Speed up slightly for a natural flow.");
  }
  if (feedback.filler_words && feedback.filler_words.length > 0) {
    sug.push("Reduce the use of filler words like 'um', 'uh', or 'like'.");
  }
  if (sug.length === 0) sug.push("Excellent! Your voice tone and delivery are engaging.");
  return sug;
}
