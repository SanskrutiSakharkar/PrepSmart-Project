import os
import time
import re
import math
import numpy as np
from typing import List, Dict, Any

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

import librosa
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# --- Ollama setup ---
try:
    import ollama
    OLLAMA_HOST = os.environ.get("OLLAMA_URL", "http://ollama:11434")
    if not getattr(ollama, "BASE_URL", None):
        # Wait for Ollama to be ready
        max_retries = 10
        for i in range(max_retries):
            try:
                import requests
                r = requests.get(OLLAMA_HOST, timeout=3)
                if r.status_code == 200:
                    print(f"Ollama is running at {OLLAMA_HOST}")
                    break
            except Exception:
                print(f"Waiting for Ollama... attempt {i+1}/{max_retries}")
                time.sleep(3)
        else:
            print(f"WARNING: Ollama did not respond after {max_retries} attempts. AI endpoints may fail.")
        ollama.BASE_URL = OLLAMA_HOST
    OLLAMA_AVAILABLE = True
    print("Using Ollama base URL:", ollama.BASE_URL)
except Exception as e:
    print("Ollama import failed:", e)
    OLLAMA_AVAILABLE = False

# --- Flask app ---
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024
CORS(app, origins=["http://54.163.25.182", "http://localhost:3000", "http://localhost"], supports_credentials=True)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- Utility functions ---
TOKEN_RX = re.compile(r"\b[a-zA-Z0-9\-\+\.#]+\b")
def tokenize_words(text: str) -> List[str]:
    return TOKEN_RX.findall(text.lower())

def extract_keywords(text: str) -> set:
    return set([w for w in tokenize_words(text) if len(w) > 3])

def ats_ngrams(text: str) -> set:
    words = tokenize_words(text)
    return set(" ".join(words[i:i+2]) for i in range(len(words)-1)) | set(" ".join(words[i:i+3]) for i in range(len(words)-2))

def nonempty_lines(text: str) -> List[str]:
    return [ln.strip() for ln in re.split(r"[\r\n]+", text) if ln.strip()]

# --- Resume analysis functions ---
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

# --- Other endpoints (voice/audio, behavioral, health) ---
# Keep the previous code exactly as you have it, no change needed here
# Just ensure OLLAMA_AVAILABLE is True and Ollama waits using the retry loop above

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
