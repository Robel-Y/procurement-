// src/pages/UserRegistration.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";

const UserRegistration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "requester",
    department: "",
    phone: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [validationErrors, setValidationErrors] = useState({});

  // Only admin can access this page
  if (user?.role !== "admin") {
    return (
      <div className="fade-in">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Access Denied</h1>
          </div>
          <div className="p-3 text-center">
            <p>You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.department) {
      errors.department = "Department is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });
    setValidationErrors({});

    try {
      const userPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
      };

      const response = await userService.createUser(userPayload);

      console.log("Register response:", response); // debug

      if (response.success) {
        setMessage({
          type: "success",
          text: "User created successfully! The new user can now log in.",
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "requester",
          department: "",
          phone: "",
        });
      } else {
        setMessage({
          type: "error",
          text: response.message || "Failed to create user.",
        });

        if (response.errors) {
          setValidationErrors(response.errors);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage({
        type: "error",
        text: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (field) => {
    return validationErrors[field] ? (
      <div
        className="error-message"
        style={{
          color: "var(--error)",
          fontSize: "0.75rem",
          marginTop: "0.25rem",
        }}
      >
        {validationErrors[field]}
      </div>
    ) : null;
  };

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <h1 className="card-title mb-1">Register New User</h1>
        <p style={{ color: "var(--text-light)" }}>
          Create new user accounts with specific roles and permissions
        </p>
      </div>

      <div className="card">
        <div className="p-3">
          {message.text && (
            <div
              className={`alert ${
                message.type === "success" ? "alert-success" : "alert-error"
              } mb-3`}
              style={{
                padding: "12px",
                borderRadius: "var(--border-radius)",
                border:
                  message.type === "success"
                    ? "1px solid var(--success)"
                    : "1px solid var(--error)",
              }}
            >
              <div className="d-flex align-center justify-between">
                <span>{message.text}</span>
                <button
                  onClick={() => setMessage({ type: "", text: "" })}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-control ${
                      validationErrors.name ? "error" : ""
                    }`}
                    placeholder="Enter full name"
                    disabled={loading}
                  />
                  {getErrorMessage("name")}
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-control ${
                      validationErrors.email ? "error" : ""
                    }`}
                    placeholder="Enter email address"
                    disabled={loading}
                  />
                  {getErrorMessage("email")}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-control ${
                      validationErrors.password ? "error" : ""
                    }`}
                    placeholder="Enter temporary password"
                    disabled={loading}
                  />
                  {getErrorMessage("password")}
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter phone number"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="role">User Role *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-control"
                    disabled={loading}
                  >
                    <option value="requester">Requester</option>
                    <option value="approver">Approver</option>
                    <option value="admin">Administrator</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="department">Department *</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`form-control ${
                      validationErrors.department ? "error" : ""
                    }`}
                    disabled={loading}
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="HR">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Procurement">Procurement</option>
                  </select>
                  {getErrorMessage("department")}
                </div>
              </div>
            </div>

            <div className="form-group">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ minWidth: "150px" }}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner"
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "8px",
                      }}
                    ></span>
                    Creating User...
                  </>
                ) : (
                  "Create User Account"
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline ml-2"
                onClick={() => {
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    role: "requester",
                    department: "",
                    phone: "",
                  });
                  setValidationErrors({});
                  setMessage({ type: "", text: "" });
                }}
                disabled={loading}
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Role Information */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title">Role Permissions</h3>
        </div>
       
        <div className="p-3">
          <div className="row">
            <div className="col-3">
              <h5>Requester</h5>
              <ul style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
                <li>Create purchase requests</li>
                <li>View own requests</li>
                <li>Submit for approval</li>
              </ul>
            </div>
            <div className="col-3">
              <h5>Approver</h5>
              <ul style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
                <li>Approve/reject requests</li>
                <li>View department requests</li>
                <li>Budget oversight</li>
              </ul>
            </div>
            <div className="col-3">
              <h5>Admin</h5>
              <ul style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
                <li>Full system access</li>
                <li>User management</li>
                <li>System configuration</li>
              </ul>
            </div>
            <div className="col-3">
              <h5>Supplier</h5>
              <ul style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
                <li>View available bids</li>
                <li>Submit proposals</li>
                <li>Track orders</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
