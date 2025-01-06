import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { username, password });
      setMessage(response.data.message);
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      setMessage('Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setMessage('Logged out successfully');
  };

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div>
      <h1>{isLoggedIn ? 'Welcome' : 'Login'}</h1>
      {isLoggedIn ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </>
      )}
      <p>{message}</p>
    </div>
  );
}

export default Login;
