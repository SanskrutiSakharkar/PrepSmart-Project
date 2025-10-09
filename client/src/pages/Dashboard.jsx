import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-bg">
      {/* Navbar */}
      <nav className="dashboard-navbar">
        <span className="dashboard-logo" onClick={() => navigate("/dashboard")}>
          PrepSmart
        </span>
        <div className="dashboard-links">
          <button onClick={() => navigate("/upload")}>Upload Resume & JD</button>
          <button onClick={() => navigate("/feedback")}>Get AI Feedback</button>
          <button onClick={() => navigate("/voice-feedback")}>Voice Analysis</button>
          <button onClick={() => navigate("/techround")}>Coding Round</button>
          <button onClick={() => navigate("/answer-questions")}>Tech Q&amp;A</button>
          <button className="dashboard-logout" onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-left">
          <h1>Welcome to PrepSmart Dashboard!</h1>
          <p>
            Your personal AI-powered space for interview prep.<br />
            Upload, practice, get instant feedback, and track your progress, all in one place.
          </p>
        </div>
        <div className="dashboard-hero-right">
          <img src="/dashboard.png" alt="Dashboard Illustration" className="dashboard-hero-img" />
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="dashboard-stats">
        <div className="dashboard-card">
          <img src="/uploadresume.png" alt="Upload Resume" className="dashboard-card-img" />
          <h2>Resume–JD Match</h2>
          <p>Analyze your resume against job descriptions and get actionable AI tips to boost your match score.</p>
          <button className="dashboard-red-btn" onClick={() => navigate("/upload")}>
            Run AI Match
          </button>
        </div>
        <div className="dashboard-card">
          <img src="/aifeedback.png" alt="AI Feedback" className="dashboard-card-img" />
          <h2>Behavioral AI Feedback</h2>
          <p>Get instant, actionable AI feedback on your STAR and behavioral interview responses.</p>
          <button className="dashboard-red-btn" onClick={() => navigate("/feedback")}>
            Get Feedback
          </button>
        </div>
        <div className="dashboard-card">
          <img src="/uploadvoice.png" alt="Voice Analysis" className="dashboard-card-img" />
          <h2>Voice Analysis</h2>
          <p>Upload a voice sample and receive emotion, tone, and confidence insights from AI.</p>
          <button className="dashboard-red-btn" onClick={() => navigate("/voice-feedback")}>
            Try Voice Analysis
          </button>
        </div>
        <div className="dashboard-card">
          <img src="/codinground.png" alt="Coding Round" className="dashboard-card-img" />
          <h2>Coding Round</h2>
          <p>Practice real-world coding interview questions with instant evaluation and suggestions.</p>
          <button className="dashboard-red-btn" onClick={() => navigate("/techround")}>
            Start Coding
          </button>
        </div>
        <div className="dashboard-card">
          <img src="/techqa.png" alt="Technical Q&A" className="dashboard-card-img" />
          <h2>Technical Q&amp;A</h2>
          <p>Answer or generate technical interview questions across Python, SQL, React and more.</p>
          <button className="dashboard-red-btn" onClick={() => navigate("/answer-questions")}>
            Start Tech Q&amp;A
          </button>
        </div>
        {/* PROGRESS CARD */}
        <div className="dashboard-card">
          <img src="/progress.png" alt="Progress" className="dashboard-card-img" />
          <h2>Track Your Progress</h2>
          <p>View charts and stats of your skill growth, improvement, and interview readiness over time.</p>
          <button className="dashboard-red-btn" onClick={() => navigate("/progress")}>
            View Progress
          </button>
        </div>
      </section>
    </div>
  );
}
