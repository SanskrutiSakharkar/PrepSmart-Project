# PREPSMART: Interview Feedback Using Voice and AI



## Overview

**PrepSmart** is a next-generation interview preparation platform that uses advanced Natural Language Processing (NLP) and voice analytics to give personalized, actionable feedback for job seekers.  
The platform empowers users to analyze and improve their resumes, match them with job descriptions, practice technical and coding questions, and sharpen their behavioral answers, **all with instant, 
explainable feedback and visual progress tracking.**



##  Features

- **Resume–Job Description (JD) Matching**
  - Upload your resume and a target JD. PrepSmart extracts text, computes semantic similarity using Sentence Transformers, calculates a match score, and identifies missing skills or keywords.
- **Technical Round Practice**
  - Answer open-ended technical theory questions. The system checks your response for completeness, key concepts, and provides suggestions for improvement.
- **Coding Round Evaluation**
  - Attempt coding problems in your favorite language. Submissions are auto-graded using Judge0, with instant feedback on test case success, errors, and efficiency.
- **Voice-Based Behavioral Interview Analysis**
  - Record or upload answers to behavioral interview questions. The platform analyzes speech for filler words, sentiment, clarity, and structure - offering tips to improve delivery.
- **Personalized, Explainable Feedback**
  - All feedback is generated using transparent, rule-based logic based on your submissions—no black box AI or hallucinations.
- **Progress Dashboard**
  - Visualize your improvement over time in areas like resume–JD match percentage, technical/coding accuracy, and speech performance.
- **Secure & Privacy-Focused**
  - All data processing and feedback generation are performed locally—no sensitive data is sent to third-party AI services.


##  System Architecture

[User Upload/Record] → [Frontend (React.js)]
↓
[Backend API (Node.js, Flask)]
↓
[NLP Analysis (Python), Judge0 for code, MongoDB for storage]
↓
[Rule-based Feedback Engine]
↓
[Frontend Dashboard & Feedback]


##  How It Works

### 1. Resume–JD Analysis
- Extracts text from both documents.
- Embeds with Sentence Transformers for semantic understanding.
- Calculates a cosine similarity score (as a % match).
- Uses NLP to extract and compare required skills.
- **Outputs:**  
  - Overall match score  
  - List of missing keywords/skills  
  - Specific suggestions for improvement

### 2. Technical Round Evaluation
- User submits a text answer.
- System checks answer for required concepts and keywords using NLP.
- Detects missing information and provides tips.
- **Outputs:**  
  - Coverage summary  
  - Suggestions for more complete answers

### 3. Coding Round Evaluation
- User submits code (multiple languages supported).
- Backend sends code to Judge0 for execution and testing.
- Runs against standard and edge-case test cases.
- Checks for correctness, errors, and efficiency.
- **Outputs:**  
  - Pass/fail by test case  
  - Hints for fixing errors  
  - Code quality tips

### 4. Voice-Based Behavioral Analysis
- User records or uploads audio.
- Speech is transcribed to text.
- NLP and audio analysis extract:
  - Sentiment/tone
  - Filler word count
  - Answer length and structure
- **Outputs:**  
  - Speech clarity and confidence feedback  
  - Tips for improving structure (e.g., STAR method)  
  - Reduction advice for fillers/hesitations

### 5. Personalized Feedback Generation
- Uses deterministic, template-based logic.
- Every suggestion is **directly tied to analysis results** (e.g., "missing Python, REST API").
- No external LLMs or generative AI, **100% explainable, transparent, and privacy-focused**.

### 6. Progress Dashboard
- MongoDB stores user attempts, scores, and feedback.
- Frontend (React + Recharts) displays:
  - Score histories
  - Progress graphs (resume–JD, coding, behavioral)




## Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React.js,CSS, Recharts                |
| Backend    | Node.js (Express), Python (Flask)     |
| NLP/Voice  | Sentence Transformers, spaCy, librosa,|
|            |  Google Speech-to-Text                |
| Code Judge | Judge0 API                            |
| Database   | MongoDB Atlas                         |
| DevOps     | Docker, AWS EC2, Github                       |

##  Getting Started

### 1. Clone the repository

git clone https://github.com/SanskrutiSakharkar/PrepSmart-Project.git

cd prepsmart

### 2. Install Dependencies
Backend (Node.js + Python)

cd backend
npm install             # For Node.js API (coding, technical, dashboard)
pip install -r requirements.txt  # For Flask NLP/audio service
Frontend

cd ../frontend
npm install

#### 3. Configure Environment
Backend:
Add .env files for secrets (MongoDB URI, Judge0 credentials, etc.)
Set API endpoints as needed.

Frontend:
Update REACT_APP_API_URL in .env if backend URL is different.

### 4. Run the App
Backend:

Start Node API: npm start

Start Flask service: python app.py

Frontend:

Start React app: npm start

Open http://localhost:3000 in your browser.

### Example Workflow

Upload your resume and JD.

Review match % and missing skills.

Answer technical and coding questions.

Record and analyze behavioral answers.

Read personalized feedback and view progress charts.

Repeat, improve, and ace your next interview!

### How PrepSmart Feedback Differs from "AI" Competitors

PrepSmart:
Uses transparent, deterministic rules—always explains why feedback was given.

No LLMs, no hallucinations.

User data stays private; never sent to third-party AI models.

### Typical AI Apps:
May use LLMs, which can be unpredictable, generic, or send data to external servers.
