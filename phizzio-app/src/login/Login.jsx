// Login.js
import React, { useState, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate  } from 'react-router-dom';
import axios from 'axios';

// const Login = () => {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleLogin = async () => {
//     try {
//       const response = await axios.post('http://localhost:5000/api/login', { username, password });
//       console.log(response.data);
//       if (response.data.user.role === 'physio') {
//         navigate('/physio');
//       } else if (response.data.user.role === 'patient') {
//         navigate('/patient');
//       } else {
//         // Handle other roles or unexpected data
//         setError('Invalid role');
//       }
//       // Handle successful login
//     } catch (error) {
//       setError('Invalid credentials');
//       console.error('Error logging in:', error);
//       // Handle login error
//     }
//   };

//   return (
//     <div className="flex justify-center items-center h-screen">
//       <div className="bg-gray-100 p-8 rounded shadow-lg w-96">
//         <h2 className="text-2xl font-semibold mb-4">Login</h2>
//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           className="w-full px-4 py-2 rounded border border-gray-300 mb-4 focus:outline-none focus:border-blue-500"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full px-4 py-2 rounded border border-gray-300 mb-4 focus:outline-none focus:border-blue-500"
//         />
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         <button
//           onClick={handleLogin}
//           className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//         >
//           Login
//         </button>
//       </div>
//     </div>
//   );
// };

import { SignIn, useUser } from '@clerk/clerk-react';

const Login = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      if (user.publicMetadata.role === 'physio') {
        navigate('/physio');
      } else if (user.publicMetadata.role === 'patient') {
        navigate('/patient');
      }
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <SignIn
        signUpUrl="/signup"
        onSignIn={(authData) => {
          console.log('User signed in:', authData);
        }}
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-500 hover:bg-blue-700 text-white rounded-lg py-2 px-4',
            formFieldInput: 'border-gray-300 rounded-md',
            formFieldLabel: 'text-gray-700',
            formFieldError: 'text-red-500',
            formFieldHint: 'text-gray-500',
            formFieldInputFocused: 'focus:border-blue-500 focus:outline-none focus:shadow-outline',
          },
        }}
      />
    </div>
  );
};

export default Login;
