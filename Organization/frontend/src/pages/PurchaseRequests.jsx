// src/pages/PurchaseRequests.jsx - Updated with working Edit functionality
import React, { useState, useEffect } from "react";
import { purchaseRequestService } from "../services/purchaseRequests";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate, getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router-dom";

const PurchaseRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await purchaseRequestService.getAll();
      console.log("PurchaseRequests API Response:", response);

      if (response.success) {
        const allRequests = response.data?.data || response.data || [];

        if (!Array.isArray(allRequests)) {
          setError("Invalid data format received from server");
          return;
        }

        let filteredRequests = allRequests;

        // For requesters, only show their requests
        if (user?.role === "requester") {
          filteredRequests = allRequests.filter(
            (req) =>
              req.requestedBy?._id === user._id || req.requestedBy === user._id
          );
        }

        setRequests(filteredRequests);
      } else {
        setError(response.error || "Failed to load requests");
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
      console.error("Fetch requests error:", error);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Edit request function
  const handleEditRequest = (requestId) => {
    console.log("Editing request:", requestId);
    navigate(`/purchase-requests/${requestId}?edit=true`);
  };

  const handleViewRequest = (requestId) => {
    navigate(`/purchase-requests/${requestId}`);
  };

  const handleCreateRequest = () => {
    navigate("/create-purchase-request");
  };

  const handleSubmitRequest = async (requestId) => {
    try {
      setError("");
      const response = await purchaseRequestService.submit(requestId);

      if (response.success) {
        // Refresh the list
        fetchRequests();
      } else {
        setError(response.error || "Failed to submit request");
      }
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return "badge-draft";

    switch (status.toLowerCase()) {
      case "draft":
        return "badge-draft";
      case "submitted":
      case "pending":
        return "badge-submitted";
      case "approved":
        return "badge-approved";
      case "rejected":
        return "badge-rejected";
      case "ordered":
        return "badge-success";
      default:
        return "badge-draft";
    }
  };

  const canCreateRequest = user?.role === "admin" || user?.role === "requester";
  const canEditRequest = (request) => {
    return (
      (user?.role === "admin" || user?.role === "requester") &&
      request.status === "draft"
    );
  };

  const safeRequests = Array.isArray(requests) ? requests : [];

  const filteredRequests = safeRequests.filter((request) => {
    if (filter === "all") return true;
    if (filter === "submitted") {
      return request.status === "submitted" || request.status === "pending";
    }
    return request.status === filter;
  });

  const getRequestCount = (status) => {
    if (!Array.isArray(safeRequests)) return 0;

    if (status === "submitted") {
      return safeRequests.filter(
        (r) => r.status === "submitted" || r.status === "pending"
      ).length;
    }
    return safeRequests.filter((r) => r.status === status).length;
  };

  if (loading) {
    return (
      <div className="card text-center p-3">
        <Spinner size="lg" />
        <p className="mt-2">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <div>
          <h1 className="card-title mb-1">
            {user?.role === "requester" ? "My Requests" : "All Requests"}
          </h1>
          <p style={{ color: "var(--text-light)" }}>
            {user?.role === "requester"
              ? "Manage your purchase requests"
              : "View and manage all purchase requests"}
          </p>
        </div>

        <div className="d-flex gap-2">
          {canCreateRequest && (
            <button className="btn btn-primary" onClick={handleCreateRequest}>
              ➕ Create Request
            </button>
          )}
          <button
            onClick={fetchRequests}
            className="btn btn-outline"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-3">
          <div className="d-flex justify-between align-center">
            <div>
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={() => setError("")}
              className="btn btn-sm btn-outline"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card mb-3">
        <div className="p-3">
          <div className="d-flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${
                filter === "all" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilter("all")}
            >
              All ({safeRequests.length})
            </button>
            <button
              className={`btn btn-sm ${
                filter === "draft" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilter("draft")}
            >
              Draft ({getRequestCount("draft")})
            </button>
            <button
              className={`btn btn-sm ${
                filter === "submitted" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilter("submitted")}
            >
              Pending ({getRequestCount("submitted")})
            </button>
            <button
              className={`btn btn-sm ${
                filter === "approved" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilter("approved")}
            >
              Approved ({getRequestCount("approved")})
            </button>
            <button
              className={`btn btn-sm ${
                filter === "rejected" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilter("rejected")}
            >
              Rejected ({getRequestCount("rejected")})
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        {filteredRequests.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  {user?.role !== "requester" && <th>Requested By</th>}
                  <th>Department</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <strong>{request.title}</strong>
                      {request.description && (
                        <div
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--text-light)",
                          }}
                        >
                          {request.description.substring(0, 60)}...
                        </div>
                      )}
                    </td>
                    {user?.role !== "requester" && (
                      <td>{request.requestedBy?.name || "Unknown"}</td>
                    )}
                    <td>{request.department || "N/A"}</td>
                    <td>{formatCurrency(request.budget || 0)}</td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(
                          request.status
                        )}`}
                      >
                        {request.status || "draft"}
                      </span>
                    </td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => handleViewRequest(request._id)}
                          className="btn btn-outline btn-sm"
                        >
                          View
                        </button>

                        {/* FIXED: Edit button now works */}
                        {canEditRequest(request) && (
                          <button
                            onClick={() => handleEditRequest(request._id)}
                            className="btn btn-outline btn-sm"
                          >
                            Edit
                          </button>
                        )}

                        {request.status === "draft" && canCreateRequest && (
                          <button
                            onClick={() => handleSubmitRequest(request._id)}
                            className="btn btn-primary btn-sm"
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No Requests Found</h3>
              <p>
                {filter === "all"
                  ? "No purchase requests found."
                  : `No ${filter} requests found.`}
              </p>
              {canCreateRequest && filter === "all" && (
                <button
                  className="btn btn-primary mt-2"
                  onClick={handleCreateRequest}
                >
                  Create Your First Request
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseRequests;
