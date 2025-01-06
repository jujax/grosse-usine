import React, { useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch(`http://localhost:8080/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const data = await response.json();
      setMessage(data.message);
      localStorage.setItem('token', data.token);
    } catch (error) {
      if (error.message) {
        setMessage(`Login failed: ${error.message}`);
      } else {
        setMessage('Login failed: An unknown error occurred');
      }
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
