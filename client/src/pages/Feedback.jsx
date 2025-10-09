import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaMicrophone, FaStop, FaCheckCircle, FaSyncAlt } from "react-icons/fa";
import BackButton from "../components/BackButton";
import { getPersonalizedBehavioralSuggestions } from "../utils/suggestions";
import "./Feedback.css";

export default function Feedback() {
  const [questions, setQuestions] = useState([
    "Tell me about a time you overcame a challenge.",
    "Describe a situation where you worked under pressure.",
    "Give an example of leadership in your experience.",
    "How do you resolve conflict within a team?",
    "Tell me about a time you received constructive criticism."
  ]);

  const [answer, setAnswer] = useState("");
  const [personalSuggestions, setPersonalSuggestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(questions[0]);
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setAnswer(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Generate AI questions (fetch from backend)
  const generateQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:8000/ollama/behavioral-questions");
      if (res.data.questions) {
        setQuestions(res.data.questions);
        setSelectedQuestion(res.data.questions[0]);
      }
    } catch (err) {
      console.error("Error fetching AI questions:", err);
      alert("Failed to fetch AI questions. Check backend.");
    }
  };

  const handleAnswerChange = (e) => setAnswer(e.target.value);

  const handleGetFeedback = () => {
    if (!answer.trim()) return;
    const suggestions = getPersonalizedBehavioralSuggestions(answer);
    setPersonalSuggestions(suggestions);
  };

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fb-bg">
      <BackButton />
      <div className="fb-card">
        <div className="fb-logo">PrepSmart</div>
        <h2 className="fb-subtitle">AI Feedback on Behavioral Answers</h2>

        <div className="fb-section">
          <h3>
            <FaCheckCircle className="fb-section-icon" /> Behavioral Interview Questions
          </h3>
          <ul className="fb-questions-list">
            {questions.map((q, i) => (
              <li
                key={i}
                className={q === selectedQuestion ? "selected-question" : ""}
                onClick={() => setSelectedQuestion(q)}
              >
                {q}
              </li>
            ))}
          </ul>
          <button className="fb-ai-btn" onClick={generateQuestions}>
            <FaSyncAlt /> Generate More with AI
          </button>
        </div>

        <div className="fb-section">
          <label>Your answer (type or record):</label>
          <div className="fb-record-container">
            <button
              className={`fb-record-btn ${isRecording ? "recording" : ""}`}
              onClick={startRecording}
            >
              <FaMicrophone /> Speak
            </button>
            <button className="fb-record-btn stop-btn" onClick={stopRecording}>
              <FaStop /> Stop
            </button>
          </div>
          <textarea
            value={answer}
            onChange={handleAnswerChange}
            placeholder="Type or record your STAR/behavioral answer here..."
          />
          <button className="fb-btn" onClick={handleGetFeedback}>Get AI Feedback</button>
        </div>

        {personalSuggestions.length > 0 && (
          <div className="fb-section fb-feedbackbox">
            <h3>
              <FaCheckCircle className="fb-section-icon" /> Personalized Suggestions
            </h3>
            <ul className="fb-suggestions-list">
              {personalSuggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
