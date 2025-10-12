import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-bg">
      <nav className="dashboard-navbar">
        <span className="dashboard-logo" onClick={() => navigate("/dashboard")}>PrepSmart</span>
        <div className="dashboard-links">
          <button onClick={() => navigate("/upload")}>Upload Resume & JD</button>
          <button onClick={() => navigate("/feedback")}>Get AI Feedback</button>
          <button onClick={() => navigate("/voice-feedback")}>Voice Analysis</button>
          <button onClick={() => navigate("/techround")}>Coding Round</button>
          <button onClick={() => navigate("/answer-questions")}>Tech Q&A</button>
          <button className="dashboard-logout" onClick={() => { localStorage.removeItem("token"); navigate("/"); }}>
            Logout
          </button>
        </div>
      </nav>

      <section className="dashboard-hero">
        <div className="dashboard-hero-left">
          <h1>Welcome to PrepSmart Dashboard!</h1>
          <p>
            Your personal AI-powered space for interview prep.<br/>
            Upload, practice, get instant feedback, and track your progress.
          </p>
        </div>
        <div className="dashboard-hero-right">
          <img src="/dashboard.png" alt="Dashboard Illustration" className="dashboard-hero-img"/>
        </div>
      </section>

    {/* ===== Feature Cards ===== */}
      <section className="dashboard-stats">
        {/* Resume–JD Match */}
        <div className="dashboard-card">
          <img
            src="/uploadresume.png"
            alt="Resume upload illustration"
            className="dashboard-card-img"
          />
          <h2>Resume–JD Match</h2>
          <p>
            Analyze your resume against job descriptions and get actionable AI tips to boost your
            match score.
          </p>
          <button className="dashboard-red-btn" onClick={() => goTo("/upload")}>
            Run AI Match
          </button>
        </div>

        {/* Behavioral AI Feedback */}
        <div className="dashboard-card">
          <img
            src="/aifeedback.png"
            alt="AI feedback illustration"
            className="dashboard-card-img"
          />
          <h2>Behavioral AI Feedback</h2>
          <p>
            Get instant, actionable feedback on your STAR and behavioral interview responses using
            AI-driven insights.
          </p>
          <button className="dashboard-red-btn" onClick={() => goTo("/feedback")}>
            Get Feedback
          </button>
        </div>

        {/* Voice Analysis */}
        <div className="dashboard-card">
          <img
            src="/uploadvoice.png"
            alt="Voice analysis illustration"
            className="dashboard-card-img"
          />
          <h2>Voice Analysis</h2>
          <p>
            Upload a voice sample and receive emotion, tone, and confidence insights from our AI
            voice analyzer.
          </p>
          <button className="dashboard-red-btn" onClick={() => goTo("/voice-feedback")}>
            Try Voice Analysis
          </button>
        </div>

        {/* Coding Round */}
        <div className="dashboard-card">
          <img
            src="/codinground.png"
            alt="Coding round illustration"
            className="dashboard-card-img"
          />
          <h2>Coding Round</h2>
          <p>
            Practice real-world coding interview questions with instant evaluation, execution, and
            improvement suggestions.
          </p>
          <button className="dashboard-red-btn" onClick={() => goTo("/techround")}>
            Start Coding
          </button>
        </div>

        {/* Technical Q&A */}
        <div className="dashboard-card">
          <img
            src="/techqa.png"
            alt="Technical Q&A illustration"
            className="dashboard-card-img"
          />
          <h2>Technical Q&amp;A</h2>
          <p>
            Answer or generate technical interview questions across Python, SQL, React, and more
            using AI.
          </p>
          <button className="dashboard-red-btn" onClick={() => goTo("/answer-questions")}>
            Start Tech Q&amp;A
          </button>
        </div>

        {/* Progress Tracking */}
        <div className="dashboard-card">
          <img
            src="/progress.png"
            alt="Progress tracking illustration"
            className="dashboard-card-img"
          />
          <h2>Track Your Progress</h2>
          <p>
            View charts and insights of your growth, coding accuracy, communication clarity, and
            readiness over time.
          </p>
          <button className="dashboard-red-btn" onClick={() => goTo("/progress")}>
            View Progress
          </button>
        </div>
      </section>
    </div>
  );
}
