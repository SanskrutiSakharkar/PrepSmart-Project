import os
import re
import math
import numpy as np
from typing import List, Dict, Any

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename

import librosa
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Optional: Ollama for question generation
try:
    import ollama
    OLLAMA_HOST = os.environ.get("OLLAMA_URL", "http://ollama:11434")
    if not getattr(ollama, "BASE_URL", None):
        ollama.BASE_URL = OLLAMA_HOST
except Exception:
    OLLAMA_AVAILABLE = False

# -----------------------------------------------------------------------------
# Flask app and CORS: ALLOW EC2 PUBLIC IP FRONTEND
# -----------------------------------------------------------------------------
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20 MB limit
CORS(app, origins=["http://54.163.25.182", "http://localhost:3000", "http://localhost"], supports_credentials=True)
# For production, replace with only your frontend's real domain.

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -----------------------------------------------------------------------------
# Utility Functions (NO BERT/semantic models)
# -----------------------------------------------------------------------------
TOKEN_RX = re.compile(r"\b[a-zA-Z0-9\-\+\.#]+\b")
def tokenize_words(text: str) -> List[str]:
    return TOKEN_RX.findall(text.lower())
def extract_keywords(text: str) -> set:
    return set([w for w in tokenize_words(text) if len(w) > 3])
def extract_phrases(text: str, n: int = 2) -> set:
    words = tokenize_words(text)
    return set(" ".join(words[i:i+n]) for i in range(len(words)-n+1))
def ats_ngrams(text: str) -> set:
    return extract_phrases(text, 2) | extract_phrases(text, 3)
def nonempty_lines(text: str) -> List[str]:
    return [ln.strip() for ln in re.split(r"[\r\n]+", text) if ln.strip()]

GENERIC_JD_HEADERS = {
    "responsibilities:", "requirements:", "requirement:", "responsibility:",
    "qualifications:", "qualification:", "skills required:", "about us:", "about the role:",
    "job description:", "who we are:", "who you are:", "the role:", "you will:", "we offer:"
}
def is_jd_header(line: str) -> bool:
    return line.strip().lower() in GENERIC_JD_HEADERS

WEAK_VERBS = ["helped", "worked on", "involved in", "responsible for", "supported", "participated in", "contributed to"]
VAGUE_NOUNS = ["things", "stuff", "various tasks", "miscellaneous", "several projects", "multiple duties"]
LEADERSHIP_VERBS = ["led", "managed", "mentored", "supervised", "owned", "coordinated", "directed", "headed", "oversaw"]
JUNIOR_VERBS = ["assisted", "supported", "helped", "participated", "contributed"]
OUTDATED_TECH = ["angularjs", "svn", "j2ee", "cobol", "flash", "jquery", "backbone"]
MODERN_TECH = ["react", "aws", "docker", "github actions", "terraform", "kubernetes", "mocha", "typescript"]

def keyword_diagnostics(resume: str, jd: str) -> Dict[str, Any]:
    jd_lines = [ln for ln in nonempty_lines(jd) if not is_jd_header(ln)]
    jd_clean = "\n".join(jd_lines)
    jd_keywords = extract_keywords(jd_clean)
    resume_keywords = extract_keywords(resume)
    missing_keywords = sorted(list(jd_keywords - resume_keywords))
    overlap_keywords = sorted(list(jd_keywords & resume_keywords))
    jd_phr = ats_ngrams(jd_clean)
    res_phr = ats_ngrams(resume)
    missing_phrases = sorted(list(jd_phr - res_phr))
    overlap_phrases = sorted(list(jd_phr & res_phr))
    keyword_coverage = round(100.0 * len(overlap_keywords) / (len(jd_keywords) + 1e-5), 2)
    phrase_coverage = round(100.0 * len(overlap_phrases) / (len(jd_phr) + 1e-5), 2)
    return {
        "missing_keywords": missing_keywords,
        "overlap_keywords": overlap_keywords,
        "missing_phrases": missing_phrases,
        "overlap_phrases": overlap_phrases,
        "keyword_coverage": keyword_coverage,
        "phrase_coverage": phrase_coverage
    }
def bullet_quality(resume_text: str) -> List[Dict[str, Any]]:
    issues = []
    for line in nonempty_lines(resume_text):
        probs = []
        if any(line.lower().startswith(v) for v in WEAK_VERBS):
            probs.append("weak verb")
        if not re.search(r"(\d+[%$]?)|(\byears?\b)|(\bmonths?\b)|(\bweeks?\b)|(\bclients?\b)|(\busers?\b)", line.lower()):
            probs.append("no metric")
        if any(vn in line.lower() for vn in VAGUE_NOUNS):
            probs.append("vague noun")
        if probs:
            issues.append({"text": line, "issues": probs})
    return issues
def improve_bullet(b: Dict[str, Any]) -> str:
    text = b["text"]
    improved = text
    for verb in WEAK_VERBS:
        if text.lower().startswith(verb):
            improved = text[len(verb):].strip().capitalize()
            improved = f"Streamlined {improved}, reducing errors by 20%."
            break
    if "no metric" in b["issues"]:
        if not improved.endswith("."):
            improved += "."
        improved += " Include a measurable result (for example, reduced time by 30 percent)."
    if "vague noun" in b["issues"]:
        improved = improved.replace("things", "customer requests").replace("stuff", "support tickets")
    return improved

def semantic_coverage(resume_text: str, jd_text: str, tfidf_thresh: float = 0.45) -> list:
    # No BERT/semantic model installed in minimal version.
    return []

def leadership_score(resume_text: str) -> Dict[str, Any]:
    lines = nonempty_lines(resume_text)
    leader = sum(1 for ln in lines if any(ln.lower().startswith(v) for v in LEADERSHIP_VERBS))
    junior = sum(1 for ln in lines if any(ln.lower().startswith(v) for v in JUNIOR_VERBS))
    total = len(lines)
    return {
        "leadership_bullet_count": leader,
        "junior_bullet_count": junior,
        "leadership_ratio": round(100.0 * leader / (total + 1e-5), 2) if total else 0
    }
def tech_presence(resume_text: str) -> Dict[str, List[str]]:
    lower = resume_text.lower()
    return {
        "outdated_tech": [t for t in OUTDATED_TECH if t in lower],
        "modern_tech": [t for t in MODERN_TECH if t in lower]
    }
def relevance_at_top(resume_text: str, jd_text: str) -> Dict[str, Any]:
    lines = nonempty_lines(resume_text)
    top_n = max(1, len(lines) // 3)
    top_blob = " ".join(lines[:top_n]).lower()
    jd_keywords = list(extract_keywords(jd_text))
    present = [kw for kw in jd_keywords if kw in top_blob]
    return {"present_keywords_top": sorted(set(present)), "relevance_at_top": bool(present)}
def resume_personalized_suggestions(resume: str, jd: str, diag: Dict[str, Any]) -> List[str]:
    sugs = []
    cov = diag.get("keyword_coverage", 0.0)
    if cov >= 70:
        sugs.append("Excellent keyword coverage. Your resume aligns closely with the job description.")
    elif cov >= 40:
        sugs.append("Good coverage. Add more JD-specific tools and responsibilities to improve alignment.")
    else:
        sugs.append("Coverage is low. Introduce more JD-relevant skills, tools, and outcomes throughout your bullets.")
    missing_kw = diag.get("missing_keywords", [])
    if missing_kw:
        sugs.append("Consider adding these missing skills or keywords: " + ", ".join(missing_kw[:10]))
    weak = bullet_quality(resume)
    if weak:
        sugs.append(f"{len(weak)} bullet points could be strengthened. Use stronger action verbs, include metrics, and avoid vague nouns.")
    return sugs

@app.route("/analyze/resume", methods=["POST"])
def analyze_resume_endpoint():
    try:
        data = request.get_json(force=True)
        resume = (data.get("resume") or "").strip()
        jd = (data.get("jobDesc") or "").strip()
        if not resume or not jd:
            return jsonify({"error": "Missing resume or jobDesc"}), 400
        vec = TfidfVectorizer()
        X = vec.fit_transform([resume, jd])
        tfidf_score = float(cosine_similarity(X[0:1], X[1:2])[0][0]) * 100.0
        diag = keyword_diagnostics(resume, jd)
        diag["uncovered_jd_bullets"] = []  # No semantic coverage in minimal mode
        diag["leadership"] = leadership_score(resume)
        diag.update(tech_presence(resume))
        diag.update(relevance_at_top(resume, jd))
        suggestions = resume_personalized_suggestions(resume, jd, diag)
        return jsonify({"match_score": round(tfidf_score, 2), "diagnostics": diag, "suggestions": suggestions})
    except Exception as e:
        print("Resume analysis error:", e)
        return jsonify({"error": "Failed to analyze resume"}), 500

# -----------------------------------------------------------------------------
# Voice analysis
# -----------------------------------------------------------------------------
VOICE_BASE_SUGGESTIONS = {
    "calm": "Your tone is calm and controlled. Add vocal variety and emphasis to avoid sounding flat.",
    "excited": "Good enthusiasm. Ensure pacing remains measured and words are articulated clearly.",
    "tired": "Energy is low. Project your voice more, sit upright, and emphasize key phrases.",
    "neutral": "Consider more variation in pitch and volume to increase engagement."
}

def voice_personalized_suggestions(emotion: str, tempo: float, energy: float, pitch: float, filler_words: List[str]) -> List[str]:
    sugs = []
    if emotion in VOICE_BASE_SUGGESTIONS:
        sugs.append(VOICE_BASE_SUGGESTIONS[emotion])
    if tempo < 80:
        sugs.append("Pace is slow. Increase your words per minute slightly to maintain energy.")
    elif tempo > 160:
        sugs.append("Pace is fast. Slow down to improve clarity and allow ideas to land.")
    if energy < 0.02:
        sugs.append("Overall energy is low. Project more and speak from the diaphragm.")
    elif energy > 0.12:
        sugs.append("Energy is high. Balance intensity with clear articulation.")
    if pitch < 100:
        sugs.append("Pitch is low. Raise pitch slightly on positive points to sound more upbeat.")
    elif pitch > 220:
        sugs.append("Pitch is high. Relax the throat and lower pitch slightly for steadiness.")
    if filler_words:
        common = ", ".join(sorted(set(filler_words)))
        sugs.append(f"Reduce filler words such as {common}. Use a short pause instead of a filler.")
    sugs.append("Use intentional pauses after key points. It signals confidence and helps listeners process information.")
    sugs.append("Emphasize action words and accomplishments to convey impact and ownership.")
    return sugs

@app.route("/analyze/audio", methods=["POST"])
def analyze_audio_endpoint():
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        transcript = (request.form.get("transcript") or "").strip()
        filler_words = []
        if transcript:
            filler_words = re.findall(r"\b(um+|uh+|er+|like|you know|sort of|kind of)\b", transcript.lower())

        file = request.files["audio"]
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        y, sr = librosa.load(filepath, sr=None)

        if y.ndim > 1:
            y = librosa.to_mono(y)

        # Feature extraction
        try:
            energy_val = librosa.feature.rms(y=y)
            energy = float(np.mean(energy_val))
        except Exception as e:
            print("Energy extraction error:", e)
            energy = None

        try:
            tempo_val, _ = librosa.beat.beat_track(y=y, sr=sr)
            tempo = float(tempo_val)
        except Exception as e:
            print("Tempo extraction error:", e)
            tempo = None

        try:
            pitch_arr = librosa.yin(y, fmin=50, fmax=300, sr=sr)
            pitch = float(np.nanmean(pitch_arr))
            if math.isnan(pitch):
                pitch = None
        except Exception as e:
            print("Pitch extraction error:", e)
            pitch = None

        # Emotion
        if energy is not None and tempo is not None and energy < 0.02 and tempo < 80:
            emotion = "calm"
        elif pitch is not None and pitch > 200 and energy is not None and energy > 0.10:
            emotion = "excited"
        elif tempo is not None and tempo < 60 and pitch is not None and pitch < 100:
            emotion = "tired"
        else:
            emotion = "neutral"

        # Metrics dict
        metrics = {
            "emotion": emotion,
            "tempo_bpm": round(tempo, 2) if tempo is not None else "N/A",
            "energy_rms": round(energy, 5) if energy is not None else "N/A",
            "pitch_hz": round(pitch, 2) if pitch is not None else "N/A",
            "filler_words": filler_words
        }
        print("Voice analysis metrics:", metrics)

        suggestions = voice_personalized_suggestions(
            emotion,
            tempo if tempo is not None else 0,
            energy if energy is not None else 0,
            pitch if pitch is not None else 0,
            filler_words
        )

        return jsonify({
            "emotion": emotion,
            "tempo": tempo,
            "energy": energy,
            "pitch": pitch,
            "suggestions": suggestions
        })
    except Exception as e:
        print("Audio analysis error:", e)
        return jsonify({"error": "Failed to process audio"}), 500

# -----------------------------------------------------------------------------
# Ollama behavioral questions endpoint
# -----------------------------------------------------------------------------
@app.route("/ollama/behavioral-questions", methods=["GET"])
@cross_origin()
def generate_behavioral_questions():
    prompt = "Generate 5 unique STAR-format behavioral interview questions for technology job interviews. Return ONLY a numbered list."
    try:
        if not OLLAMA_AVAILABLE:
            print("Ollama not available, returning fallback questions.")
            return jsonify({"questions": [
                "Tell me about a time you overcame a challenge.",
                "Describe a situation where you worked under pressure.",
                "Give an example of leadership in your experience.",
                "How do you resolve conflict within a team?",
                "Tell me about a time you received constructive criticism."
            ]})
        print("Calling Ollama for questions...")
        response = ollama.generate(model="llama3", prompt=prompt)
        print("Ollama response:", response)
        raw_output = response["response"]
        questions = [line.strip(" -0123456789.") for line in raw_output.split("\n") if line.strip()]
        return jsonify({"questions": questions})
    except Exception as e:
        print("Ollama generation error:", e)
        return jsonify({"error": "Failed to generate questions"}), 500

# -----------------------------------------------------------------------------
# Health check
# -----------------------------------------------------------------------------
@app.route("/health")
def health():
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
