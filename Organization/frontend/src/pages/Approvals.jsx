import React, { useState, useEffect } from "react";
import { purchaseRequestService } from "../services/purchaseRequests";
import {
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
} from "../utils/helpers";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";

const Approvals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvalModal, setApprovalModal] = useState({
    isOpen: false,
    request: null,
  });
  const [approvalData, setApprovalData] = useState({
    status: "approved",
    comments: "",
  });
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await purchaseRequestService.getAll({
        status: "submitted",
      });

      if (response.success) {
        // Safely extract the array of requests
        const allRequests = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setRequests(allRequests);
      } else {
        setError(response.error || "Failed to load pending approvals");
        setRequests([]);
      }
    } catch (error) {
      setError("Failed to fetch data from server");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading("approval");
    try {
      const response = await purchaseRequestService.approve(
        approvalModal.request._id,
        approvalData
      );
      if (response.success) {
        setApprovalModal({ isOpen: false, request: null });
        setApprovalData({ status: "approved", comments: "" });
        await fetchPendingApprovals();
      } else {
        alert(response.error || "Failed to process approval");
      }
    } catch (error) {
      alert("Failed to process approval. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="card text-center p-3">
        <Spinner size="lg" />
        <p>Loading pending approvals...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <div>
          <h1 className="card-title mb-1">Pending Approvals</h1>
          <p style={{ color: "var(--text-light)" }}>
            {requests.length} requests waiting for your review
          </p>
        </div>
        <button onClick={fetchPendingApprovals} className="btn btn-outline">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div
          className="card mb-3"
          style={{ background: "var(--error)", color: "white" }}
        >
          <div className="p-3">
            {error}
            <button
              onClick={fetchPendingApprovals}
              className="btn btn-outline btn-sm ml-2"
              style={{ background: "white", color: "var(--error)" }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="card text-center p-4">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <h3>All Caught Up!</h3>
            <p>No pending approvals at the moment.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-2">
          {requests.map((request) => (
            <div key={request._id} className="card slide-up">
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: "1.125rem" }}>
                  {request.title}
                </h3>
                <span
                  className={`badge ${getStatusBadgeClass(request.status)}`}
                >
                  {request.status}
                </span>
              </div>

              <div className="mb-3">
                <p
                  style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}
                >
                  {request.description}
                </p>
              </div>

              <div className="grid grid-2 mb-3">
                <div>
                  <strong>Category</strong>
                  <div style={{ color: "var(--text-light)" }}>
                    {request.category}
                  </div>
                </div>
                <div>
                  <strong>Quantity</strong>
                  <div style={{ color: "var(--text-light)" }}>
                    {request.quantity}
                  </div>
                </div>
                <div>
                  <strong>Budget</strong>
                  <div style={{ color: "var(--text-light)" }}>
                    {formatCurrency(request.budget)}
                  </div>
                </div>
                <div>
                  <strong>Urgency</strong>
                  <div
                    style={{
                      color: "var(--text-light)",
                      textTransform: "capitalize",
                    }}
                  >
                    {request.urgency}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <strong>Requested By</strong>
                <div style={{ color: "var(--text-light)" }}>
                  {request.requestedBy?.name} • {request.department}
                </div>
              </div>

              <div className="d-flex justify-between align-center">
                <small style={{ color: "var(--text-light)" }}>
                  Created {formatDate(request.createdAt)}
                </small>
                <button
                  onClick={() => setApprovalModal({ isOpen: true, request })}
                  className="btn btn-primary btn-sm"
                >
                  Review Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      <Modal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ isOpen: false, request: null })}
        title="Review Purchase Request"
      >
        {approvalModal.request && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <strong>{approvalModal.request.title}</strong>
              <div style={{ color: "var(--text-light)", marginTop: 6 }}>
                {approvalModal.request.description}
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 12 }}>
              <div>
                <div>
                  <strong>Category</strong>
                  <div style={{ color: "var(--text-light)" }}>
                    {approvalModal.request.category}
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>Quantity</strong>
                  <div style={{ color: "var(--text-light)" }}>
                    {approvalModal.request.quantity}
                  </div>
                </div>
              </div>

              <div>
                <div>
                  <strong>Budget</strong>
                  <div style={{ color: "var(--text-light)" }}>
                    {formatCurrency(approvalModal.request.budget)}
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>Requested By</strong>
                  <div style={{ color: "var(--text-light)" }}>
                    {approvalModal.request.requestedBy?.name} •{" "}
                    {approvalModal.request.department}
                  </div>
                </div>
              </div>
            </div>

            <hr style={{ margin: "12px 0" }} />

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                Decision
              </label>
              <select
                value={approvalData.status}
                onChange={(e) =>
                  setApprovalData({ ...approvalData, status: e.target.value })
                }
                className="form-control"
                disabled={!!actionLoading}
              >
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                Comments (optional)
              </label>
              <textarea
                value={approvalData.comments}
                onChange={(e) =>
                  setApprovalData({ ...approvalData, comments: e.target.value })
                }
                className="form-control"
                rows={4}
                disabled={!!actionLoading}
              />
            </div>

            <div className="d-flex justify-end" style={{ gap: 8 }}>
              <button
                className="btn btn-outline"
                onClick={() =>
                  setApprovalModal({ isOpen: false, request: null })
                }
                disabled={!!actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleApprove}
                disabled={!!actionLoading}
              >
                {actionLoading
                  ? "Processing..."
                  : approvalData.status === "approved"
                  ? "Submit Approval"
                  : "Submit Rejection"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Approvals;
