import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { setToken } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  // Use environment variable for backend API URL
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });

      if (res.data?.token) {
        // Save JWT to localStorage and context
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        navigate("/dashboard");
      } else {
        setStatus("Invalid server response.");
      }
    } catch (err) {
      setStatus(err.response?.data?.msg || "Login failed.");
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-logo">PrepSmart</div>
        <h2>Sign in to your account</h2>
        <div className="login-fields">
          <label>Email</label>
          <input
            className="login-input"
            type="email"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password</label>
          <input
            className="login-input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {status && <div className="login-status">{status}</div>}

        <button type="submit" className="login-btn">
          Login
        </button>

        <div className="login-alt">
          Don’t have an account?{" "}
          <span
            className="login-link"
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </div>
      </form>
    </div>
  );
}
