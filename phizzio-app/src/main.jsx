import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import Login from './login/Login.jsx';
import Physio from './Physio/Physio.jsx';
import Patient from './Physio/Patient.jsx';
import PatientVW from './Patient/PatientVW.jsx';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './Signup/Signup.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/physio" element={<Physio />} />
        <Route path="/patient" element={<PatientVW />} />
        <Route path="physio/patient/:id" element={<Patient />} />
      </Routes>
    </Router>
  </React.StrictMode>,
);