import React from "react";

function UnverifiedEmail() {
  const handleResendVerificationEmail = async () => {
    const username = localStorage.getItem("username");
    try {
      const response = await fetch(
        `http://localhost:8080/resend-verification-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      if (error.message) {
        alert(`Failed to resend verification email: ${error.message}`);
      } else {
        alert("Failed to resend verification email: An unknown error occurred");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <div>
      <h1>Email Not Verified</h1>
      <p>
        Your email is not verified. Please check your email for the verification
        link.
      </p>
      <button onClick={handleResendVerificationEmail}>
        Resend Verification Email
      </button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default UnverifiedEmail;
