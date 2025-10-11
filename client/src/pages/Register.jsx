import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Register.css";

export default function Register() {
  const { setToken } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      const res = await axios.post("/api/auth/register", { name, email, password });
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        navigate("/dashboard");
      } else setStatus("Invalid server response.");
    } catch (err) { setStatus(err.response?.data?.msg || "Registration failed."); }
  };

  return (
    <div className="register-bg">
      <form className="register-card" onSubmit={handleRegister}>
        <div className="register-logo">PrepSmart</div>
        <h2>Create your account</h2>
        <div className="register-fields">
          <label>Full Name</label>
          <input type="text" required value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name" className="register-input"/>
          <label>Email</label>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" className="register-input"/>
          <label>Password</label>
          <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Choose a password" className="register-input"/>
        </div>
        {status && <div className="register-status">{status}</div>}
        <button type="submit" className="register-btn">Register</button>
        <div className="register-alt">Already have an account? <span className="register-link" onClick={()=>navigate("/login")}>Login here</span></div>
      </form>
    </div>
  );
}
