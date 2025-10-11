import React, { useEffect, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { FaCheckCircle, FaBrain, FaSmile, FaMicrophone, FaFileAlt, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Progress.css";

const CARD_HELP = {
  coding: "Your accuracy in coding rounds",
  tech: "Accuracy answering tech MCQs",
  sentiment: "Positivity in voice answers",
  filler: "Filler words per answer (less is better)",
  resume: "How well your resume matches JDs"
};

const CARD_ICONS = {
  coding: <FaCheckCircle style={{ color: "#2563eb", fontSize: 22 }} />,
  tech: <FaBrain style={{ color: "#38bdf8", fontSize: 22 }} />,
  sentiment: <FaSmile style={{ color: "#fbbf24", fontSize: 22 }} />,
  filler: <FaMicrophone style={{ color: "#ef4444", fontSize: 22 }} />,
  resume: <FaFileAlt style={{ color: "#10b981", fontSize: 22 }} />,
};

function friendlyDate(date) {
  try { return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); } 
  catch { return ""; }
}

function showRange(obj, key, decimals = 1) {
  if (!obj.start || !obj.end) return "-";
  return `${(obj.start[key] ?? 0).toFixed(decimals)} → ${(obj.end[key] ?? 0).toFixed(decimals)}`;
}

export default function Progress() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProgress() {
      const res = await fetch("/api/progress/summary", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const json = await res.json();
      setData(json);
    }
    fetchProgress();
  }, []);

  if (!data) return <div className="progress-loading">Loading Progress...</div>;

  return (
    <div className="progress-outer">
      <button className="progress-back-btn" onClick={() => navigate("/dashboard")}><FaArrowLeft /> Back to Dashboard</button>

      <div className="progress-dashboard">
        <h1>Progress Dashboard</h1>
        <div className="progress-subtitle">Track your AI interview prep progress.</div>

        <div className="growth-cards">
          {["coding","tech","sentiment","filler","resume"].map(key => (
            <div className="growth-card" key={key}>
              <div className="card-icon">{CARD_ICONS[key]}</div>
              <h3>{{
                coding:"Coding Accuracy", tech:"Tech Accuracy", sentiment:"Sentiment",
                filler:"Filler Words (↓ better)", resume:"Resume Match %"
              }[key]}</h3>
              <div className="card-value">
                {showRange(
                  data.growth[key],
                  key==="filler"?"filler_count":key==="resume"?"match_percent":key==="sentiment"?"sentiment":"accuracy",
                  key==="sentiment"?2:1
                )}
                {["resume","coding","tech"].includes(key)?"%":""}
              </div>
              <span className={data.growth[key].diff>=0||key==="filler"?"up":"down"}>
                {data.growth[key].diff>=0||key==="filler"?"▲":"▼"} {Math.abs(data.growth[key].diff).toFixed(key==="sentiment"?2:1)}{["resume","coding","tech"].includes(key)?"%":""}
              </span>
              <div className="card-help">{CARD_HELP[key]}</div>
            </div>
          ))}
        </div>

        {/* Sentiment Chart */}
        <div className="chart-section">
          <h2>Sentiment Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.sentimentTrend}>
              <Line type="monotone" dataKey="sentiment" stroke="#2563eb" strokeWidth={3}/>
              <CartesianGrid stroke="#eee"/>
              <XAxis dataKey="date" tickFormatter={friendlyDate}/>
              <YAxis domain={[0,1]}/>
              <Tooltip labelFormatter={friendlyDate}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Filler Chart */}
        <div className="chart-section">
          <h2>Filler Words Usage</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.fillerTrend}>
              <Bar dataKey="filler_count" fill="#fbbf24"/>
              <CartesianGrid stroke="#eee"/>
              <XAxis dataKey="date" tickFormatter={friendlyDate}/>
              <YAxis/>
              <Tooltip labelFormatter={friendlyDate}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resume Match Chart */}
        <div className="chart-section">
          <h2>Resume Match % Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.resumeTrend}>
              <Line type="monotone" dataKey="match_percent" stroke="#38bdf8" strokeWidth={3}/>
              <CartesianGrid stroke="#eee"/>
              <XAxis dataKey="date" tickFormatter={friendlyDate}/>
              <YAxis domain={[0,100]}/>
              <Tooltip labelFormatter={friendlyDate}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Feedback */}
        <div className="feedback-log">
          <h2>Recent AI Feedback</h2>
          <div className="feedback-list">
            {data.feedbackLog?.length ? (
              data.feedbackLog.map((f,i)=>(
                <div className="feedback-entry" key={i}>
                  <span className="feedback-date">{f.date?new Date(f.date).toLocaleDateString():"—"}</span>
                  <span className="feedback-text">{f.feedback}</span>
                </div>
              ))
            ): <div className="feedback-none">No feedback yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
