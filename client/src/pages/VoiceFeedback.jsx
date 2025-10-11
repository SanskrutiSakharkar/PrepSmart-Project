import React, { useState, useRef } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import WaveSurfer from "wavesurfer.js";
import { FaMicrophone, FaPlay } from "react-icons/fa";
import "./VoiceFeedback.css";

export default function VoiceFeedback() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [waveform, setWaveform] = useState(null);
  const waveformRef = useRef(null);
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState("");
  const [questions, setQuestions] = useState([
    "Tell me about a time you overcame a challenge.",
    "Describe a situation where you worked under pressure.",
    "Give an example of leadership in your experience.",
    "How do you resolve conflict within a team?",
    "Tell me about a time you received constructive criticism."
  ]);

  const token = localStorage.getItem("token");

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "audio/*": [] },
    onDrop: async (acceptedFiles) => {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      loadWaveform(selectedFile);
    },
  });

  const loadWaveform = (audioFile) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (waveform) waveform.destroy();
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#cbd5e1",
        progressColor: "#ef233c",
        height: 80,
        responsive: true,
      });
      ws.loadBlob(audioFile);
      setWaveform(ws);
    };
    reader.readAsDataURL(audioFile);
  };

  const handlePlay = () => {
    if (waveform) waveform.playPause();
  };

  const handleSubmit = async () => {
    if (!file) {
      setStatus("Please upload a recording first.");
      return;
    }

    setStatus("Analyzing...");

    try {
      const formData = new FormData();
      formData.append("audio", file);

      // POST to your backend route (this route forwards to AI engine)
      const response = await axios.post("/api/voice-feedback/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        timeout: 60000, // allow longer processing time
      });

      setAnalysis(response.data);
      setStatus("Analysis successful!");
    } catch (err) {
      console.error("Error analyzing or saving:", err);
      setStatus(
        err.response?.data?.error || "Analysis failed. Please try another recording."
      );
    }
  };

  const handleGenerateQuestions = async () => {
    try {
      const res = await axios.get("/api/voice-feedback/ai-questions", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.questions) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      console.error("Error generating questions:", err);
    }
  };

  return (
    <div className="fb-bg">
      <button className="fb-back-btn" onClick={() => window.history.back()}>
        ← Back to Dashboard
      </button>

      <div className="fb-card">
        <div className="fb-logo">
          <FaMicrophone style={{ marginRight: "8px" }} />
          PrepSmart
        </div>
        <h2>Voice Emotion Feedback</h2>
        <p className="fb-subtext">Upload a short WAV/MP3 (5–20s works best)</p>

        <div {...getRootProps({ className: "fb-dropzone" })}>
          <input {...getInputProps()} />
          <p>Click or drag to upload audio</p>
          {fileName && <span className="fb-filename">{fileName}</span>}
        </div>

        {file && (
          <div className="waveform-container">
            <div ref={waveformRef} className="waveform" />
            <button className="fb-play-btn" onClick={handlePlay}>
              <FaPlay /> Play / Pause
            </button>
          </div>
        )}

        <button className="fb-btn" onClick={handleSubmit} disabled={!file}>
          Analyze Tone
        </button>
        {status && <div className="fb-status">{status}</div>}

        {analysis && (
          <div className="fb-feedbackbox">
            <h4>Personalized AI Feedback</h4>
            <p><strong>Emotion:</strong> {analysis.emotion}</p>
            <p><strong>Pitch:</strong> {analysis.pitch ? `${analysis.pitch.toFixed(2)} Hz` : "N/A"}</p>
            <p><strong>Energy:</strong> {analysis.energy ? `${(analysis.energy * 100).toFixed(1)}%` : "N/A"}</p>
            <p><strong>Tempo:</strong> {analysis.tempo ? `${analysis.tempo.toFixed(1)} BPM` : "N/A"}</p>
            <h4>Suggestions</h4>
            <ul className="fb-suggestions-list">
              {analysis.suggestions?.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="fb-feedbackbox">
          <h4>Behavioral Interview Questions</h4>
          <ul>
            {questions.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
          <button className="fb-btn-secondary" onClick={handleGenerateQuestions}>
            Generate More with AI
          </button>
        </div>
      </div>
    </div>
  );
}
