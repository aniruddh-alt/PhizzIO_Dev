// Login.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate  } from 'react-router-dom';
import axios from 'axios';
// import setSessionData from '../utils/SetSession';
// import { getSessionData } from '../utils/GetSession';
// import { clearSessionData } from '../utils/ClearSession';
// import { useEffect } from 'react'; 


const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sessionData, setSessionData] = useState({});

  // useEffect( () => {
  //   const fetchSessionData = async () =>{
  //     const data = await getSessionData();
  //     setSessionData(data);
  //   };

  //   fetchSessionData();
  // }, []);

  // const handleSetSession = async () =>{
  //   try{
  //     const data = {'username': username, 'password': password};
  //     await setSessionData(data);
  //     const updatedSessionData = await getSessionData();
  //     setSessionData(updatedSessionData);
  //   }
  //   catch(error){
  //     console.error('Error setting session data:', error);
  //   }
  // }
  // const handleClearSession = async () => {
  //   await clearSessionData();
  //   setSessionDataState({});
  // };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      console.log(response.data);
      if (response.data.user.role === 'physio') {
        navigate('/physio');
      } else if (response.data.user.role === 'patient') {
        navigate('/patient');
      } else {
        // Handle other roles or unexpected data
        setError('Invalid role');
      }
      // Handle successful login
    } catch (error) {
      setError('Invalid credentials');
      console.error('Error logging in:', error);
      // Handle login error
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-gray-100 p-8 rounded shadow-lg w-96">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
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
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
