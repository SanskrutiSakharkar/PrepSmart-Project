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

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, 
        { email, password 
      });
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        navigate("/dashboard");
      } else {
        setStatus("Invalid response from server.");
      }
    } catch (err) {
      setStatus(err.response?.data?.msg || "Login failed. Try again.");
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
            onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
          <label>Password</label>
          <input
            className="login-input"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>
        {status && <div className="login-status">{status}</div>}
        <button type="submit" className="login-btn">Login</button>
        <div className="login-alt">
          Don’t have an account?{" "}
          <span className="login-link" onClick={() => navigate("/register")}>
            Register here
          </span>
        </div>
      </form>
    </div>
  );
}
