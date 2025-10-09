// src/components/BackButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./BackButton.css";

export default function BackButton({ to = "/dashboard", children = "Back to Dashboard" }) {
  const navigate = useNavigate();
  return (
    <button className="back-btn" onClick={() => navigate(to)}>
      <span className="back-arrow">←</span> {children}
    </button>
  );
}
