import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import "./AnswerTechnicalQuestions.css";

const SECTIONS = ["React", "Python", "SQL"];
const SECTION_TO_TOPIC = { React: "React", Python: "Python", SQL: "SQL" };

export default function AnswerTechnicalQuestions() {
  const { token } = useContext(AuthContext) || {};
  const [selectedSection, setSelectedSection] = useState(SECTIONS[0]);
  const [questionList, setQuestionList] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [aiQuestion, setAiQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [apiError, setApiError] = useState("");

  const getTopicForSection = (section) => SECTION_TO_TOPIC[section] || section;

  const fetchQuestions = useCallback(async () => {
    setLoading(true); setApiError("");
    try {
      const topic = getTopicForSection(selectedSection);
      const res = await axios.get(`/api/tech-questions?topic=${encodeURIComponent(topic)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setQuestionList(Array.isArray(res.data) ? res.data : []);
      setCurrentIdx(0);
    } catch (err) {
      setQuestionList([]);
      setApiError(err.response?.data?.msg || err.message || "Error loading questions. Please login again.");
    } finally { setLoading(false); }
  }, [selectedSection, token]);

  useEffect(() => { fetchQuestions(); setAiQuestion(""); setAnswer(""); setFeedback(""); }, [fetchQuestions]);

  const handleGenerateAI = async () => {
    setLoading(true); setApiError("");
    try {
      const topic = getTopicForSection(selectedSection);
      // Call backend endpoint returning a static/fallback AI question
      const res = await axios.post("/api/tech-questions/generate", { topic }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setAiQuestion(res.data.question);
      setAnswer(""); setFeedback("");
    } catch (err) {
      setApiError(err.response?.data?.msg || err.message || "AI generation failed");
    } finally { setLoading(false); }
  };

  const handleSaveAI = async () => {
    if (!aiQuestion) return;
    setApiError("");
    try {
      const topic = getTopicForSection(selectedSection);
      await axios.post("/api/tech-questions/save", { question: aiQuestion, topic, difficulty: "ai" }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setAiQuestion(""); setAnswer(""); fetchQuestions();
      alert("Question saved!");
    } catch (err) { setApiError(err.response?.data?.msg || err.message || "Failed to save question"); }
  };

  const handleNext = () => { if (questionList.length === 0) return; setCurrentIdx((idx) => (idx + 1) % questionList.length); setAnswer(""); setFeedback(""); };
  const handlePrev = () => { if (questionList.length === 0) return; setCurrentIdx((idx) => (idx - 1 + questionList.length) % questionList.length); setAnswer(""); setFeedback(""); };

  const handleGetFeedback = async (question, ans) => {
    if (!ans) return alert("Please write an answer first.");
    setFeedback("Loading feedback..."); setApiError("");
    try {
      const topic = getTopicForSection(selectedSection);
      const res = await axios.post("/api/tech-answers/feedback", { question, answer: ans, topic }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setFeedback(res.data.feedback);
    } catch (err) { setApiError(err.response?.data?.msg || err.message || "Failed to get feedback"); setFeedback(""); }
  };

  return (
    <>
      <div className="back-button-row"><BackButton to="/dashboard" /></div>
      <div className="answertech-container">
        <h2 className="answertech-title">Technical Questions (Answer & Generate)</h2>
        <div className="answertech-sections">
          {SECTIONS.map(sec => (
            <button key={sec} className={`answertech-tab${selectedSection===sec?" active":""}`} onClick={()=>setSelectedSection(sec)}>{sec}</button>
          ))}
        </div>
        {apiError && <div className="answertech-error">{apiError}</div>}

        <div className="answertech-card">
          <div style={{display:"flex", alignItems:"center", gap:16}}>
            <button className="answertech-btn" onClick={handleGenerateAI} disabled={loading}>Generate AI Question</button>
            {aiQuestion && <>
              <span style={{flex:1, fontWeight:500}}>{aiQuestion}</span>
              <button className="answertech-save" onClick={handleSaveAI}>Save to DB</button>
            </>}
          </div>
          {aiQuestion && <div style={{marginTop:18}}>
            <textarea className="answertech-textarea" placeholder="Write your answer here..." value={answer} onChange={e=>setAnswer(e.target.value)} />
            <button className="answertech-btn" style={{marginTop:10}} onClick={()=>handleGetFeedback(aiQuestion,answer)}>Get Feedback</button>
            {feedback && <div className="answertech-feedback"><b>Feedback:</b><br/>{feedback}</div>}
          </div>}
        </div>

        {!aiQuestion && <div className="answertech-card">
          <h4 style={{marginBottom:12}}>Saved Questions in <b>{selectedSection}</b> Section</h4>
          {loading?<div>Loading...</div>:
           questionList.length===0?<div style={{color:"#aaa"}}>No questions saved yet. Generate or add some!</div>:<>
            <div style={{fontWeight:600,fontSize:16,minHeight:36}}>{questionList[currentIdx].question}</div>
            <textarea className="answertech-textarea" placeholder="Write your answer here..." value={answer} onChange={e=>setAnswer(e.target.value)} />
            <div style={{display:"flex", justifyContent:"space-between", marginTop:12}}>
              <button className="answertech-btn" onClick={handlePrev}>Previous</button>
              <button className="answertech-btn" onClick={()=>handleGetFeedback(questionList[currentIdx].question, answer)}>Get Feedback</button>
              <button className="answertech-btn" onClick={handleNext}>Next</button>
            </div>
            {feedback && <div className="answertech-feedback"><b>Feedback:</b><br/>{feedback}</div>}
           </>}
        </div>}
      </div>
    </>
  );
}
