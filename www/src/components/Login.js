import React, { useState, useEffect } from "react";
import UnverifiedEmail from "./UnverifiedEmail";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(true);

  useEffect(() => {
    // Code à exécuter lorsque isEmailVerified change
    console.log("isEmailVerified:", isEmailVerified);
    if (!isEmailVerified) {
      // Par exemple, vous pouvez afficher un message ou recharger un composant
      console.log("Email non vérifié");
    }
  }, [isEmailVerified]); // Le tableau de dépendances contient isEmailVerified

  const handleLogin = async () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      setMessage("Invalid email format");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const data = await response.json();

      setMessage(data.message);
      localStorage.setItem("token", data.token);
    } catch (error) {
      if (error.message === "Email not verified") {
        localStorage.setItem("username", username);
        setIsEmailVerified(false);
        setMessage("Email not verified");
        console.log("Email not verified");
      } else if (error.message) {
        setMessage(`Login failed: ${error.message}`);
      } else {
        setMessage("Login failed: An unknown error occurred");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setMessage("Logged out successfully");
  };

  const isLoggedIn = !!localStorage.getItem("token");
  if (!isEmailVerified) {
    return <UnverifiedEmail username={username} />;
  } else {
    return (
      <div>
        <h1>{isLoggedIn ? "Welcome" : "Login"}</h1>
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
          </>
        )}
        <p>{message}</p>
      </div>
    );
  }
}

export default Login;
