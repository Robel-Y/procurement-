import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Procurement System</h1>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              className="card mb-2"
              style={{
                background: "var(--error)",
                color: "white",
                padding: "1rem",
                border: "none",
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ marginRight: "0.5rem" }} />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <small style={{ color: "var(--text-light)" }}>
            Enter your registered email and password
          </small>
        </div>

        {/* Demo credentials hint */}
        <div
          className="card mt-3"
          style={{ background: "var(--primary-light)", border: "none" }}
        >
          <div className="text-center">
            <small style={{ color: "var(--primary-dark)" }}>
              <strong>Demo Credentials:</strong>
              <br />
              Admin: admin@company.com / password123
              <br />
              Approver: approver@company.com / password123
              <br />
              Requester: user@company.com / password123
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
