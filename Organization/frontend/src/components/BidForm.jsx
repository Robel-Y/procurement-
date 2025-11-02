// src/components/BidForm.jsx
import React, { useState, useEffect } from "react";
import Spinner from "./Spinner";

const BidForm = ({
  bid,
  onSubmit,
  onCancel,
  loading,
  requestDetails,
  suppliers = [],
}) => {
  const [formData, setFormData] = useState({
    supplier: "",
    bidAmount: "",
    deliveryTime: "",
    proposal: "",
    notes: "",
    terms: "",
    validityPeriod: 30,
    status: "submitted",
  });

  useEffect(() => {
    if (bid) {
      setFormData({
        supplier: bid.supplier?._id || bid.supplier || "",
        bidAmount: bid.bidAmount || "",
        deliveryTime: bid.deliveryTime || "",
        proposal: bid.proposal || "",
        notes: bid.notes || "",
        terms: bid.terms || "",
        validityPeriod: bid.validityPeriod || 30,
        status: bid.status || "submitted",
      });
    }
  }, [bid]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.supplier ||
      !formData.bidAmount ||
      !formData.deliveryTime ||
      !formData.proposal
    ) {
      alert("Please fill in all required fields");
      return;
    }

    onSubmit({
      ...formData,
      bidAmount: parseFloat(formData.bidAmount),
      deliveryTime: parseInt(formData.deliveryTime),
      validityPeriod: parseInt(formData.validityPeriod),
    });
  };

  const getSelectedSupplier = () => {
    return suppliers.find((s) => s._id === formData.supplier);
  };

  return (
    <form onSubmit={handleSubmit}>
      {requestDetails && (
        <div className="card mb-4">
          <div className="p-3">
            <h6>📋 Request: {requestDetails.title}</h6>
            <div
              className="grid grid-3 gap-2 mt-2"
              style={{ fontSize: "0.875rem" }}
            >
              <div>
                <strong>Budget:</strong>
                <br />
                {requestDetails.budget
                  ? `$${requestDetails.budget}`
                  : "Not specified"}
              </div>
              <div>
                <strong>Category:</strong>
                <br />
                {requestDetails.category}
              </div>
              <div>
                <strong>Department:</strong>
                <br />
                {requestDetails.department}
              </div>
            </div>
            {requestDetails.description && (
              <p style={{ marginTop: "8px", fontSize: "0.875rem" }}>
                {requestDetails.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Supplier Selection */}
      <div className="form-group">
        <label htmlFor="supplier">Supplier *</label>
        <select
          id="supplier"
          value={formData.supplier}
          onChange={(e) => handleChange("supplier", e.target.value)}
          required
          disabled={loading}
        >
          <option value="">Select a supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.companyName}
              {supplier.contactName && ` - ${supplier.contactName}`}
              {supplier.rating && ` (⭐ ${supplier.rating})`}
            </option>
          ))}
        </select>
        {formData.supplier && getSelectedSupplier() && (
          <div
            style={{
              fontSize: "0.875rem",
              marginTop: "4px",
              color: "var(--text-light)",
            }}
          >
            📧 {getSelectedSupplier().email} • 📞 {getSelectedSupplier().phone}
          </div>
        )}
      </div>

      <div className="grid grid-2 gap-3">
        <div className="form-group">
          <label htmlFor="bidAmount">Bid Amount ($) *</label>
          <input
            id="bidAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.bidAmount}
            onChange={(e) => handleChange("bidAmount", e.target.value)}
            required
            disabled={loading}
            placeholder="Enter bid amount"
          />
          {requestDetails?.budget && formData.bidAmount && (
            <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>
              {formData.bidAmount > requestDetails.budget ? (
                <span style={{ color: "var(--error)" }}>
                  ⚠️ Above budget by $
                  {(formData.bidAmount - requestDetails.budget).toFixed(2)}
                </span>
              ) : (
                <span style={{ color: "var(--success)" }}>
                  ✅ Within budget ($
                  {(requestDetails.budget - formData.bidAmount).toFixed(2)}{" "}
                  under)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="deliveryTime">Delivery Time (Days) *</label>
          <input
            id="deliveryTime"
            type="number"
            min="1"
            value={formData.deliveryTime}
            onChange={(e) => handleChange("deliveryTime", e.target.value)}
            required
            disabled={loading}
            placeholder="Days required"
          />
        </div>
      </div>

      <div className="grid grid-2 gap-3">
        <div className="form-group">
          <label htmlFor="validityPeriod">Bid Validity (Days)</label>
          <input
            id="validityPeriod"
            type="number"
            min="1"
            max="90"
            value={formData.validityPeriod}
            onChange={(e) => handleChange("validityPeriod", e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Bid Status</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            disabled={loading}
          >
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="winning">Winning Bid</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="proposal">
          Proposal Details *
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-light)",
              marginLeft: "8px",
            }}
          >
            (Describe your offer, materials, timeline, and approach)
          </span>
        </label>
        <textarea
          id="proposal"
          value={formData.proposal}
          onChange={(e) => handleChange("proposal", e.target.value)}
          required
          disabled={loading}
          rows="4"
          placeholder="Provide detailed information about your proposal including:
• Materials and specifications
• Delivery timeline
• Quality assurance
• Support and warranty
• Implementation approach"
        />
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-light)",
            marginTop: "4px",
          }}
        >
          {formData.proposal.length}/1000 characters
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="terms">Terms & Conditions</label>
        <textarea
          id="terms"
          value={formData.terms}
          onChange={(e) => handleChange("terms", e.target.value)}
          disabled={loading}
          rows="3"
          placeholder="Payment terms, warranty details, cancellation policy, etc..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Additional Notes</label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          disabled={loading}
          rows="2"
          placeholder="Any additional information, special offers, or comments..."
        />
      </div>

      <div className="modal-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" />
              {bid ? "Updating..." : "Creating..."}
            </>
          ) : bid ? (
            "Update Bid"
          ) : (
            "Create Bid"
          )}
        </button>
      </div>
    </form>
  );
};

export default BidForm;
