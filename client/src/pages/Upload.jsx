import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getPersonalizedResumeSuggestions } from "../utils/suggestions";
import "./Upload.css";

export default function Upload() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [jobDesc, setJobDesc] = useState(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [aiResult, setAIResult] = useState(null);
  const [runningAI, setRunningAI] = useState(false);

  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [personalized, setPersonalized] = useState({ suggestions: [], missing: [] });

  // --- Upload handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setUploaded(false);
    setAIResult(null);
    setResumeText("");
    setJdText("");
    setPersonalized({ suggestions: [], missing: [] });

    if (!resume || !jobDesc) {
      setStatus("Please select both resume and job description files.");
      return;
    }
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jobDesc", jobDesc);

      await axios.post("http://localhost:5000/api/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
      });

      const textRes = await axios.get("http://localhost:5000/api/resume/texts", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResumeText(textRes.data.resumeText || "");
      setJdText(textRes.data.jdText || "");
      setStatus("Upload successful!");
      setUploaded(true);
    } catch (err) {
      setStatus(err.response?.data?.msg || "Upload failed.");
      setUploaded(false);
    } finally {
      setUploading(false);
    }
  };

  // --- Run AI Match and save feedback ---
  const handleRunAIMatch = async () => {
    setStatus("");
    setRunningAI(true);
    setAIResult(null);
    setPersonalized({ suggestions: [], missing: [] });

    try {
      const res = await axios.get("http://localhost:5000/api/resume/run-ai-match", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAIResult(res.data.result || "AI Match complete!");

      let suggestionsResult = { suggestions: [], missing: [] };
      if (resumeText && jdText) {
        suggestionsResult = getPersonalizedResumeSuggestions(resumeText, jdText);
        setPersonalized(suggestionsResult);
      }

      const scoreMatch = res.data.result.match(/AI Match Score:\s*(\d+)%/);
      const matchScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
      const matchedKeywords = res.data.matchedKeywords || [];

      // Save feedback in backend
      await axios.post(
        "http://localhost:5000/api/feedback/save",
        {
          matchScore,
          matchedKeywords,
          suggestions: suggestionsResult.suggestions,
          missingKeywords: suggestionsResult.missing,
          resumeText,
          jdText
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus("Feedback saved successfully!");
    } catch (err) {
      setAIResult("Failed to run AI match.");
      console.error(err);
    } finally {
      setRunningAI(false);
    }
  };

  // --- Render AI Feedback ---
  const renderAIFeedback = () => {
    if (!aiResult) return null;
    const scoreMatch = aiResult.match(/AI Match Score:\s*(\d+)%/);
    const keywordsMatch = aiResult.match(/Matched Keywords: (.*)/);
    const score = scoreMatch ? scoreMatch[1] : null;
    const keywords = keywordsMatch ? keywordsMatch[1] : "";

    let scoreClass = "ai-score";
    if (score) {
      const sc = parseInt(score, 10);
      scoreClass += sc >= 75 ? " high" : sc >= 45 ? " medium" : " low";
    }

    return (
      <div className="ai-feedback-card">
        <h3 className="ai-feedback-title">Personalized AI Feedback</h3>
        <div className="ai-feedback-score">
          <span>Score:</span>
          <span className={scoreClass}>{score ? `${score}%` : "N/A"}</span>
        </div>
        <div className="ai-feedback-keywords">
          Matched Keywords:
          <div className="ai-keywords-list">
            {keywords
              .split(",")
              .filter((k) => k.trim())
              .slice(0, 20)
              .map((kw, i) => (
                <span key={i} className="ai-keyword">{kw.trim()}</span>
              ))}
            {keywords.split(",").length > 20 && <span className="ai-keyword">...</span>}
          </div>
        </div>
      </div>
    );
  };

  // --- Render Personalized Suggestions ---
  const renderPersonalizedSuggestions = () => {
    if (!uploaded || (!personalized.suggestions.length && !personalized.missing.length)) return null;

    return (
      <div className="suggestion-card">
        <h3 className="suggestion-title">Personalized Suggestions</h3>
        <ul className="suggestion-list">
          {personalized.suggestions.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        {personalized.missing.length > 0 && (
          <>
            <div className="missing-keywords-label">Top Missing Keywords:</div>
            <div className="missing-keywords-list">
              {personalized.missing.slice(0, 12).map((kw, i) => (
                <span key={i} className="missing-keyword">{kw}</span>
              ))}
              {personalized.missing.length > 12 && <span className="missing-keyword">...</span>}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="upload-bg">
      {/* Fixed Back Button */}
      <button type="button" onClick={() => navigate(-1)} className="back-btn-top">
        ← Back to Dashboard
      </button>

      <div className="upload-stack">
        <form className="upload-card" onSubmit={handleSubmit}>
          <div className="upload-logo">PrepSmart</div>
          <h2 className="upload-title">Upload Resume & Job Description</h2>

          <div className="upload-fields">
            <div className="upload-field">
              <label>Resume <span className="muted">(.pdf, .docx)</span></label>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={e => setResume(e.target.files[0])}
                disabled={uploaded}
              />
              {resume && <div className="upload-filename">{resume.name}</div>}
            </div>

            <div className="upload-field">
              <label>Job Description <span className="muted">(.pdf, .docx)</span></label>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={e => setJobDesc(e.target.files[0])}
                disabled={uploaded}
              />
              {jobDesc && <div className="upload-filename">{jobDesc.name}</div>}
            </div>
          </div>

          {status && <div className={`upload-status ${uploaded ? "success" : ""}`}>{status}</div>}

          <button
            type="submit"
            className="upload-btn"
            disabled={uploading || uploaded}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {uploaded && (
            <div className="upload-success">
              <button
                type="button"
                className="ai-match-btn"
                onClick={handleRunAIMatch}
                disabled={runningAI}
              >
                {runningAI ? "Running AI Match..." : "Run AI Match"}
              </button>
            </div>
          )}
        </form>

        {aiResult && (
          <div className="feedback-container">
            <div className="feedback-row">
              {renderAIFeedback()}
              {renderPersonalizedSuggestions()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
