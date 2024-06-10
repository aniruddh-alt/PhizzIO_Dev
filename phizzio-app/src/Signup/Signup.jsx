// Signup.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate  } from 'react-router-dom';
import { ClerkProvider, SignUp, useSignUp } from '@clerk/clerk-react';

import axios from 'axios';

const Signup = () => {
    const navigate = useNavigate();
  const {isLoaded, signUp, setSession} = useSignUp();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/signup', { name, username, password, email, role });
      console.log(response.data);
      
      const signUpResult = await signUp.create({
        emailAddress: email,
        password,
        username,
        firstName: name,
        publicMetadata: { role },
      });

      const userid = response.data.user.id;
      await signUp.update({
        publicMetadata: { role, userid },
      });
      await signUp.complete();

      navigate('/login');
      // Handle successful signup
    } catch (error) {
      setError('Error signing up');
      console.error('Error signing up:', error);
      // Handle signup error
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-gray-100 p-8 rounded shadow-lg w-96">
        <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-300 mb-4 focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-300 mb-4 focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-300 mb-4 focus:outline-none focus:border-blue-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-300 mb-4 focus:outline-none focus:border-blue-500"
        />
        <select
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-300 mb-4 focus:outline-none focus:border-blue-500"
        >
            <option value="" disabled>
                Select Role
            </option>
            <option value="physio">Physiotherapist</option>
            <option value="patient">Patient</option>
        </select>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleSignup}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Signup;
