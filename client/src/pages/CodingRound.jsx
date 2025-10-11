import React, { useEffect, useState, useContext, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import "./CodingRound.css";

const sectionLanguages = { python: "python", react: "javascript", mysql: "sql" };
const sectionLabels = { python: "Python", react: "ReactJS", mysql: "MySQL" };
const themes = [{ value: "vs-dark", label: "Dark" }, { value: "light", label: "Light" }];

export default function CodingRound() {
  const { token } = useContext(AuthContext);
  const [section, setSection] = useState("python");
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(16);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    axios.get(`/api/coding-round/questions?section=${section}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setQuestions(res.data);
      if (res.data.length) {
        setSelected(res.data[0]);
        setCode(res.data[0].starterCode || "");
      } else { setSelected(null); setCode(""); }
    });
  }, [section, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setOutput("Evaluating..."); setSuggestions([]);
    try {
      const res = await axios.post("/api/coding-round/submit", {
        questionId: selected._id,
        code,
        language: sectionLanguages[section]
      }, { headers: { Authorization: `Bearer ${token}` }});
      setOutput(res.data.output);
      setSuggestions(res.data.suggestions || []);
    } catch {
      setOutput("Submission failed. Check console.");
    }
  };

  const handleAIQuestion = async () => {
    const diff = prompt("Difficulty? Easy / Medium / Hard", "Easy") || "Easy";
    setOutput("Generating AI question...");
    try {
      const res = await axios.post('/api/coding-round/ai-question', { section, difficulty: diff },
        { headers: { Authorization: `Bearer ${token}` }});
      setQuestions(qs => [res.data.question, ...qs]);
      setSelected(res.data.question);
      setCode(res.data.question.starterCode || "");
      setOutput("AI Question loaded!");
    } catch { setOutput("Failed to generate AI question."); }
  };

  const handleSaveAIQuestion = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await axios.post("/api/coding-round/save-ai-question", { question: selected },
        { headers: { Authorization: `Bearer ${token}` }});
      alert("AI Question saved to database!");
    } catch { alert("Failed to save question."); }
    setSaving(false);
  };

  const formatCode = () => {
    if (editorRef.current) editorRef.current.getAction("editor.action.formatDocument").run();
  };

  return (
    <>
      <div className="back-button-row"><BackButton to="/dashboard" /></div>
      <div className="codinground-container">
        <h2 className="codinground-title">Technical Coding Round</h2>

        <div className="codinground-toolbar">
          {Object.keys(sectionLabels).map(sec => (
            <button key={sec} className={`codinground-btn${section===sec?" active":""}`} onClick={()=>setSection(sec)}>{sectionLabels[sec]}</button>
          ))}
          <label className="codinground-label">Theme:&nbsp;
            <select className="codinground-select" value={theme} onChange={e=>setTheme(e.target.value)}>
              {themes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label className="codinground-label">Font Size:&nbsp;
            <input type="number" min={12} max={28} value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} style={{width:55}} />
          </label>
          <button className="codinground-btn codinground-format" onClick={formatCode}>Format Code</button>
          <button className="codinground-btn codinground-generate" onClick={handleAIQuestion}>+ Generate AI Question</button>
          {(selected && !selected._id) && <button className="codinground-btn codinground-save" onClick={handleSaveAIQuestion} disabled={saving}>{saving?"Saving...":"Save AI Question"}</button>}
        </div>

        <div className="codinground-questionselect">
          <label>Question:&nbsp;</label>
          <select className="codinground-select" value={selected?._id || selected?.title || ""} onChange={e=>{
            const q = questions.find(q => (q._id || q.title) === e.target.value);
            setSelected(q); setCode(q?.starterCode || "");
          }}>
            {questions.map(q => <option key={q._id || q.title} value={q._id || q.title}>{q.title}</option>)}
          </select>
        </div>

        <div className="codinground-desc">{selected?.description}</div>

        {selected?.testCases?.length>0 && (
          <div className="codinground-testcases">
            <b>Test Cases:</b>
            <ul>{selected.testCases.map((tc,i)=>(
              <li key={i}>
                <div><b>Input:</b> <pre className="codinground-pre">{tc.input}</pre></div>
                <div><b>Expected:</b> <pre className="codinground-pre">{tc.expectedOutput}</pre></div>
              </li>
            ))}</ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <MonacoEditor
            height="260px"
            language={sectionLanguages[section]}
            value={code}
            onChange={v=>setCode(v)}
            theme={theme}
            options={{fontSize,minimap:{enabled:true},lineNumbers:"on",tabSize:2,wordWrap:"on",scrollBeyondLastLine:false}}
            onMount={editor=>editorRef.current=editor}
          />
          <button type="submit" className="codinground-btn codinground-submit">Submit</button>
        </form>

        {output && <div className="codinground-output"><h4>Output:</h4><pre className="codinground-pre">{output}</pre></div>}
        {suggestions.length>0 && <div className="codinground-suggestions-card"><h4>Personalized Suggestions:</h4><ul className="codinground-suggestions-list">{suggestions.map((s,i)=><li key={i}>{s}</li>)}</ul></div>}
      </div>
    </>
  );
}
