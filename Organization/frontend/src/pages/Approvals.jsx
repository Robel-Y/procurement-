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
      const response = await purchaseRequestService.getAll({
        status: "submitted",
      });
      if (response.success) {
        setRequests(response.data || []);
      } else {
        setError(response.error || "Failed to load pending approvals");
      }
    } catch (error) {
      setError("Failed to fetch data from server");
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
            <div className="form-group">
              <label className="form-label">Request Title</label>
              <input
                type="text"
                className="form-control"
                value={approvalModal.request.title}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={approvalModal.request.description}
                disabled
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Budget</label>
              <input
                type="text"
                className="form-control"
                value={formatCurrency(approvalModal.request.budget)}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Decision</label>
              <select
                className="form-control"
                value={approvalData.status}
                onChange={(e) =>
                  setApprovalData({ ...approvalData, status: e.target.value })
                }
                disabled={actionLoading === "approval"}
              >
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Comments</label>
              <textarea
                className="form-control"
                value={approvalData.comments}
                onChange={(e) =>
                  setApprovalData({ ...approvalData, comments: e.target.value })
                }
                placeholder="Enter comments for your decision"
                disabled={actionLoading === "approval"}
                rows="3"
              />
            </div>

            <div className="d-flex justify-between gap-2">
              <button
                onClick={() =>
                  setApprovalModal({ isOpen: false, request: null })
                }
                className="btn btn-outline"
                disabled={actionLoading === "approval"}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="btn btn-success"
                disabled={actionLoading === "approval"}
              >
                {actionLoading === "approval" ? (
                  <>
                    <Spinner size="sm" />
                    Processing...
                  </>
                ) : (
                  "Submit Decision"
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Approvals;
