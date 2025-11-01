import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="login-container">
      <div className="card text-center" style={{ padding: "3rem" }}>
        <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>404</h1>
        <h2 style={{ marginBottom: "1rem" }}>Page Not Found</h2>
        <p style={{ marginBottom: "2rem", color: "var(--text-secondary)" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Go Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
