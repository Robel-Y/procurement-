import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { formatDate, getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
  });
  const [message, setMessage] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        setProfile(response.data);
        setFormData({
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          department: response.data.department || "",
          position: response.data.position || "",
        });
      } else {
        setMessage(getErrorMessage(response.error));
      }
    } catch (error) {
      setMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage("");

    try {
      const response = await userService.updateProfile(formData);
      if (response.success) {
        setProfile(response.data);
        updateUser(response.data); // Update global auth context
        setEditing(false);
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(getErrorMessage(response.error));
      }
    } catch (error) {
      setMessage("Failed to update profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card text-center p-3">
        <Spinner size="lg" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header mb-3">
        <h1 className="card-title mb-0">My Profile</h1>
        <button
          onClick={() => setEditing(!editing)}
          className="btn btn-outline"
          disabled={updateLoading}
        >
          {editing ? "Cancel Edit" : "Edit Profile"}
        </button>
      </div>

      {message && (
        <div
          className={`card mb-3 ${
            message.includes("successfully")
              ? "badge-approved"
              : "badge-rejected"
          }`}
          style={{ border: "none" }}
        >
          {message}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            {editing ? (
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={updateLoading}
              />
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile?.name || "Not set"}
                disabled
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            {editing ? (
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={updateLoading}
              />
            ) : (
              <input
                type="email"
                className="form-control"
                value={profile?.email || "Not set"}
                disabled
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            {editing ? (
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                disabled={updateLoading}
              />
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile?.phone || "Not set"}
                disabled
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            {editing ? (
              <select
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleChange}
                required
                disabled={updateLoading}
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
                <option value="Procurement">Procurement</option>
                <option value="Sales">Sales</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile?.department || "Not set"}
                disabled
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Position</label>
            {editing ? (
              <input
                type="text"
                name="position"
                className="form-control"
                value={formData.position}
                onChange={handleChange}
                placeholder="Enter your position"
                disabled={updateLoading}
              />
            ) : (
              <input
                type="text"
                className="form-control"
                value={profile?.position || "Not set"}
                disabled
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <input
              type="text"
              className="form-control"
              value={
                profile?.role
                  ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                  : "Not set"
              }
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">Member Since</label>
            <input
              type="text"
              className="form-control"
              value={
                profile?.createdAt
                  ? formatDate(profile.createdAt)
                  : "Not available"
              }
              disabled
            />
          </div>

          {editing && (
            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn btn-outline"
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <Spinner size="sm" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Account Information */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title mb-0">Account Information</h3>
        </div>
        <div className="p-3">
          <div className="d-flex justify-between mb-2">
            <span>User ID:</span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.875rem",
                color: "var(--text-light)",
              }}
            >
              {profile?._id || "N/A"}
            </span>
          </div>
          <div className="d-flex justify-between mb-2">
            <span>Last Login:</span>
            <span>
              {profile?.lastLogin
                ? formatDate(profile.lastLogin)
                : "Not available"}
            </span>
          </div>
          <div className="d-flex justify-between">
            <span>Account Status:</span>
            <span className="badge badge-approved">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
