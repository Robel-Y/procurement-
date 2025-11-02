// src/components/CreateRequestModal.js
import React, { useState } from "react";
import { purchaseRequestService } from "../services/purchaseRequests";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

const CreateRequestModal = ({ isOpen, onClose, onRequestCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    department: user?.department || "",
    urgency: "medium",
    category: "general",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const requestData = {
        ...formData,
        budget: parseFloat(formData.budget) || 0,
        status: "draft",
      };

      const response = await purchaseRequestService.createRequest(requestData);

      if (response.success) {
        onRequestCreated(response.data);
        onClose();
        // Reset form
        setFormData({
          title: "",
          description: "",
          budget: "",
          department: user?.department || "",
          urgency: "medium",
          category: "general",
        });
      } else {
        setError(response.message || "Failed to create request");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <h3 className="modal-title">Create New Purchase Request</h3>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Request Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter a descriptive title for your request"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Describe what you need to purchase and why..."
                    rows="4"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="budget" className="form-label">
                    Estimated Budget *
                  </label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="department" className="form-label">
                    Department *
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="form-control"
                    required
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
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="urgency" className="form-label">
                    Urgency Level
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="form-control"
                    disabled={loading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-control"
                    disabled={loading}
                  >
                    <option value="general">General</option>
                    <option value="technology">Technology</option>
                    <option value="office-supplies">Office Supplies</option>
                    <option value="furniture">Furniture</option>
                    <option value="services">Services</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="d-flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Creating...
                  </>
                ) : (
                  "Create Request"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper function (you might already have this in your utils)
const getErrorMessage = (error) => {
  if (error.response) {
    return error.response.data?.message || "Server error occurred";
  } else if (error.request) {
    return "Network error. Please check your connection.";
  } else {
    return error.message || "An unexpected error occurred";
  }
};

export default CreateRequestModal;
