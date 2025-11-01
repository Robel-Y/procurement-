import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { purchaseRequestService } from "../services/purchaseRequests";
import { getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";

const CreatePurchaseRequest = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    quantity: 1,
    budget: 0,
    urgency: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) : value,
    });
    // Clear errors when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      setLoading(false);
      return;
    }

    if (!formData.category) {
      setError("Category is required");
      setLoading(false);
      return;
    }

    if (formData.budget <= 0) {
      setError("Budget must be greater than 0");
      setLoading(false);
      return;
    }

    if (formData.quantity <= 0) {
      setError("Quantity must be greater than 0");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting form data:", formData); // Debug log

      const response = await purchaseRequestService.create(formData);
      console.log("Server response:", response); // Debug log

      if (response.success) {
        setSuccess("Purchase request created successfully!");
        setTimeout(() => {
          navigate("/purchase-requests");
        }, 1500);
      } else {
        const errorMsg = getErrorMessage(response);
        setError(errorMsg);
      }
    } catch (error) {
      console.error("Create request error:", error);
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <h1 className="card-title mb-0">Create Purchase Request</h1>
      </div>

      {/* Success Message */}
      {success && (
        <div
          className="card mb-3"
          style={{
            background: "var(--success)",
            color: "white",
            border: "none",
          }}
        >
          <div className="p-3">
            <div className="d-flex align-center gap-2">
              <span>✅</span>
              <span>{success}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message - Fixed Display */}
      {error && (
        <div
          className="card mb-3"
          style={{
            background: "var(--error)",
            color: "white",
            border: "none",
          }}
        >
          <div className="p-3">
            <div className="d-flex align-center gap-2">
              <span>❌</span>
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter a clear title for your request"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe what you need to purchase, why it's needed, and any specific requirements..."
              disabled={loading}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select Category</option>
              <option value="office-supplies">Office Supplies</option>
              <option value="equipment">Equipment</option>
              <option value="furniture">Furniture</option>
              <option value="software">Software</option>
              <option value="services">Services</option>
              <option value="maintenance">Maintenance</option>
              <option value="travel">Travel</option>
              <option value="training">Training</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              name="quantity"
              className="form-control"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Budget ($) *</label>
            <input
              type="number"
              name="budget"
              className="form-control"
              value={formData.budget}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              disabled={loading}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Urgency *</label>
            <select
              name="urgency"
              className="form-control"
              value={formData.urgency}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="low">Low - Can wait 2+ weeks</option>
              <option value="medium">Medium - Needed within 2 weeks</option>
              <option value="high">High - Needed within 1 week</option>
            </select>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={() => navigate("/purchase-requests")}
              className="btn btn-outline"
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
                  Creating Request...
                </>
              ) : (
                "Create Purchase Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseRequest;
