import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UnverifiedEmail from './components/UnverifiedEmail';

const App = () => {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const isEmailVerified = localStorage.getItem('isEmailVerified') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isEmailVerified');
    window.location.reload();
  };

  return (
    <Router>
      <div>
        <nav style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!isLoggedIn ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}
        </nav>
        <h1>Welcome to Grosse Usine</h1>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            isLoggedIn ? (
              <h2>Welcome back!</h2>
            ) : (
              <Login />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
