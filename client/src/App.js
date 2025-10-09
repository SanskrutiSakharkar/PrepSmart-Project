import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from "./pages/Landing";
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/Upload'; 
import PrivateRoute from './components/PrivateRoute';
import Feedback from './pages/Feedback';
import VoiceFeedback from './pages/VoiceFeedback';
import CodingRound from './pages/CodingRound';
import AnswerTechnicalQuestions from './pages/AnswerTechnicalQuestions';
import About from "./pages/About";
import Progress from "./pages/Progress"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        
        {/* Private/Protected Pages */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <ResumeUpload />
            </PrivateRoute>
          }
        /> 
        <Route
          path="/feedback"
          element={
            <PrivateRoute>
              <Feedback />
            </PrivateRoute>
          }
        /> 
        <Route
          path="/voice-feedback"
          element={
            <PrivateRoute>
              <VoiceFeedback />
            </PrivateRoute>
          }
        />
        <Route
          path="/techround"
          element={
            <PrivateRoute>
              <CodingRound />
            </PrivateRoute>
          }
        />
        <Route
          path="/answer-questions"
          element={
            <PrivateRoute>
              <AnswerTechnicalQuestions />
            </PrivateRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <PrivateRoute>
              <Progress />
            </PrivateRoute>
          }
        />

        {/* Optional 404 page */}
        <Route path="*" element={
          <div style={{
            textAlign:'center',
            margin:'80px 0',
            color:'#ef233c',
            fontWeight:700,
            fontSize:'1.3rem'
          }}>
            404 — Page Not Found
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
