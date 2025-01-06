import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './components/Login';
import Register from './components/Register';

const App = () => {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  return (
    <div>
      {isLoggedIn ? (
        <h1>Hello World</h1>
      ) : (
        <>
          <Login />
          <Register />
        </>
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
