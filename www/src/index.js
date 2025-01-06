import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './components/Login';
import Register from './components/Register';
import UnverifiedEmail from './components/UnverifiedEmail';

const App = () => {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const isEmailVerified = localStorage.getItem('isEmailVerified') === 'true';

  return (
    <div>
      <h1>Welcome to Grosse Usine</h1>
      {!isLoggedIn ? (
        <>
          <Login />
          <Register />
        </>
      ) : !isEmailVerified ? (
        <UnverifiedEmail />
      ) : (
        <>
          <h2>Welcome back!</h2>
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('isEmailVerified');
            window.location.reload();
          }}>Logout</button>
        </>
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
