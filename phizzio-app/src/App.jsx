import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { RedirectToSignIn, SignedIn, SignedOut, SignIn, SignUp, useUser } from '@clerk/clerk-react';
import Login from './login/Login.jsx';
import Physio from './Physio/Physio.jsx';
import Patient from './Physio/Patient.jsx';
import PatientVW from './Patient/PatientVW.jsx';
import Signup from './Signup/Signup.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Clerk Authentication Routes */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* Protected Routes */}
        <Route
          path="/physio"
          element={
            <SignedIn>
              <Physio />
            </SignedIn>
          }
        />
        <Route
          path="/patient"
          element={
            <SignedIn>
              <PatientVW />
            </SignedIn>
          }
        />
        <Route
          path="physio/patient/:id"
          element={
            <SignedIn>
              <Patient />
            </SignedIn>
          }
        />

        <Route
          path="/routing_page"
          element={
            <>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
              <SignedIn>
                <Patient />
              </SignedIn>
            </>
          }
        />

        {/* Redirect to sign-in if not authenticated */}
        <Route
          path="*"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          }
        />
      </Routes>
    </Router>
  );
};
export default App;
