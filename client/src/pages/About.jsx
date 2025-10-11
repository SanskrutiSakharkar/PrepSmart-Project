import React from "react";
import { useNavigate } from "react-router-dom";
import "./About.css";

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="about-bg">
      <header className="about-navbar">
        <span className="about-logo" onClick={() => navigate('/')}>PrepSmart</span>
        <nav>
          <button onClick={() => navigate('/#features')}>Features</button>
          <button className="about-active">About</button>
          <button onClick={() => navigate('/login')}>Login</button>
        </nav>
      </header>
      <main className="about-main">
        <section className="about-hero">
          <div className="about-hero-text">
            <h1>Meet the Team Behind PrepSmart</h1>
            <p>
              PrepSmart was created by a passionate team at University of Waikato to level the playing field for everyone in tech. 
              Our mission is to make top-tier interview preparation accessible and effective for all.
            </p>
          </div>
          <div className="about-hero-img">
            <img src="/about_team.png" alt="PrepSmart About Us"/>
          </div>
        </section>

        <section className="about-values">
          <h2>Our Values</h2>
          <div className="about-values-list">
            <div className="about-value-card">
              <h3>Fairness</h3>
              <p>We believe everyone deserves a fair chance; our feedback is unbiased.</p>
            </div>
            <div className="about-value-card">
              <h3>Learning-First</h3>
              <p>We're focused on helping you improve, one answer at a time.</p>
            </div>
            <div className="about-value-card">
              <h3>Transparency</h3>
              <p>Your data stays private and secure. We’ll never sell your data.</p>
            </div>
          </div>
        </section>

        <section className="about-contact">
          <h2>Contact & Collaborate</h2>
          <p>
            Want to partner, contribute, or have questions? Email us at <a href="mailto:hello@prepsmart.app">hello@prepsmart.app</a>
          </p>
        </section>
      </main>

      <footer className="about-footer">
        <span>&copy; 2025 PrepSmart | All rights reserved</span>
      </footer>
    </div>
  );
}
