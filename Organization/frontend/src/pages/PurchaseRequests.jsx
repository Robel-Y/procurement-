import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { purchaseRequestService } from "../services/purchaseRequests";
import {
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
} from "../utils/helpers";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";

const PurchaseRequests = () => {
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
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await purchaseRequestService.getAll();
      if (response.success) {
        setRequests(response.data || []);
      } else {
        setError(response.error || "Failed to load purchase requests");
      }
    } catch (error) {
      setError("Failed to fetch data from server");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (id) => {
    setActionLoading(id);
    try {
      const response = await purchaseRequestService.submit(id);
      if (response.success) {
        await fetchRequests(); // Refresh the list
      } else {
        alert(response.error || "Failed to submit request");
      }
    } catch (error) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setActionLoading(null);
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
        await fetchRequests(); // Refresh the list
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
        <p>Loading purchase requests...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header mb-3">
        <h1 className="card-title mb-0">Purchase Requests</h1>
        <Link to="/create-purchase-request" className="btn btn-primary">
          + Create New Request
        </Link>
      </div>

      {error && (
        <div
          className="card mb-3"
          style={{ background: "var(--error)", color: "white" }}
        >
          <div className="p-2">
            {error}
            <button
              onClick={fetchRequests}
              className="btn btn-outline btn-sm ml-2"
              style={{ background: "white", color: "var(--error)" }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {requests.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>
                    <div>
                      <strong>{request.title}</strong>
                      {request.description && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-light)",
                          }}
                        >
                          {request.description.substring(0, 60)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{request.category || "General"}</td>
                  <td>{request.quantity || 1}</td>
                  <td>{formatCurrency(request.budget || 0)}</td>
                  <td>
                    <span
                      className={`badge ${getStatusBadgeClass(request.status)}`}
                    >
                      {request.status || "draft"}
                    </span>
                  </td>
                  <td>{formatDate(request.createdAt)}</td>
                  <td>
                    <div className="d-flex align-center gap-1">
                      {request.status === "draft" && (
                        <button
                          onClick={() => handleSubmit(request._id)}
                          className="btn btn-primary btn-sm"
                          disabled={actionLoading === request._id}
                        >
                          {actionLoading === request._id ? (
                            <Spinner size="sm" />
                          ) : (
                            "Submit"
                          )}
                        </button>
                      )}
                      {(request.status === "submitted" ||
                        request.status === "pending") && (
                        <button
                          onClick={() =>
                            setApprovalModal({ isOpen: true, request })
                          }
                          className="btn btn-success btn-sm"
                        >
                          Review
                        </button>
                      )}
                      <Link
                        to={`/purchase-requests/${request._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center p-4">
            <h3>No Purchase Requests</h3>
            <p>You haven't created any purchase requests yet.</p>
            <Link to="/create-purchase-request" className="btn btn-primary">
              Create Your First Request
            </Link>
          </div>
        )}
      </div>

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

export default PurchaseRequests;
