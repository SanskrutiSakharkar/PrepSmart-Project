import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRobot, FaComments, FaMicrophone, FaCode, FaArrowRight } from "react-icons/fa";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-bg">
      <header className="landing-navbar">
        <span className="landing-logo" onClick={() => navigate("/")}>PrepSmart</span>
        <nav>
          <button onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})}>Features</button>
          <button onClick={() => navigate('/about')}>About</button>
          <button onClick={() => navigate('/login')}>Login</button>
        </nav>
      </header>
      <main>
        <section className="landing-hero">
          <div className="landing-hero-card">
            <h1>AI-Powered Interview Prep</h1>
            <p>
              Boost your confidence.<br/>
              Practice, analyze, and get feedback on coding, behavioral, and technical interviews, all in one place.
            </p>
            <button
              className="hero-btn"
              onClick={() => navigate('/register')}
            >
              Get Started Free <FaArrowRight style={{ marginLeft: 10, verticalAlign: "middle" }} />
            </button>
          </div>
        </section>

        <section className="landing-features" id="features">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaComments className="feature-icon" />
              <h3>Behavioral Answers</h3>
              <p>Type or record STAR responses. Get instant, actionable AI feedback on your answers.</p>
            </div>
            <div className="feature-card">
              <FaMicrophone className="feature-icon" />
              <h3>Voice Analysis</h3>
              <p>Upload voice clips. Get real-time analysis of your tone, energy, and confidence.</p>
            </div>
            <div className="feature-card">
              <FaCode className="feature-icon" />
              <h3>Technical & Coding Rounds</h3>
              <p>Practice real coding and technical questions with automatic evaluation and tips.</p>
            </div>
            <div className="feature-card">
              <FaRobot className="feature-icon" />
              <h3>AI-Powered Suggestions</h3>
              <p>Get personalized improvement suggestions for every aspect of your prep journey.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        &copy; {new Date().getFullYear()} PrepSmart. All rights reserved.
      </footer>
    </div>
  );
}
