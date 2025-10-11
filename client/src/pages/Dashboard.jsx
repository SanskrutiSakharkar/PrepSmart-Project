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

      <section className="dashboard-stats">
        {[
          { img: "/uploadresume.png", title: "Resume–JD Match", desc: "Analyze your resume against job descriptions.", btn: "/upload" },
          { img: "/aifeedback.png", title: "Behavioral AI Feedback", desc: "Get actionable AI feedback on STAR answers.", btn: "/feedback" },
          { img: "/uploadvoice.png", title: "Voice Analysis", desc: "Analyze tone, energy, and confidence.", btn: "/voice-feedback" },
          { img: "/codinground.png", title: "Coding Round", desc: "Practice coding questions with evaluation.", btn: "/techround" },
          { img: "/techqa.png", title: "Technical Q&A", desc: "Answer or generate technical interview questions.", btn: "/answer-questions" },
          { img: "/progress.png", title: "Track Your Progress", desc: "View charts and stats of skill growth.", btn: "/progress" },
        ].map((card, idx) => (
          <div className="dashboard-card" key={idx}>
            <img src={card.img} alt={card.title} className="dashboard-card-img"/>
            <h2>{card.title}</h2>
            <p>{card.desc}</p>
            <button className="dashboard-red-btn" onClick={() => navigate(card.btn)}>Go</button>
          </div>
        ))}
      </section>
    </div>
  );
}
