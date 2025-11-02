// src/pages/PurchaseRequests.js
import React, { useState, useEffect } from "react";
import { purchaseRequestService } from "../services/purchaseRequests";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate, getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";
import CreateRequestModal from "../components/CreateRequestModal";

const PurchaseRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      let response;
      if (user?.role === "requester") {
        // For requesters, only show their requests
        response = await purchaseRequestService.getAll();
        if (response.success) {
          const myRequests = response.data.filter(
            (req) =>
              req.requestedBy?._id === user._id || req.requestedBy === user._id
          );
          setRequests(myRequests);
        }
      } else {
        // For admin and approvers, show all requests
        response = await purchaseRequestService.getAll();
        if (response.success) {
          setRequests(response.data);
        }
      }

      if (!response.success) {
        setError("Failed to load requests");
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCreated = (newRequest) => {
    // Add the new request to the beginning of the list
    setRequests((prev) => [newRequest, ...prev]);
    // You might want to show a success message here
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "badge-draft";
      case "submitted":
      case "pending":
        return "badge-submitted";
      case "approved":
        return "badge-approved";
      case "rejected":
        return "badge-rejected";
      default:
        return "badge-draft";
    }
  };

  const canCreateRequest = user?.role === "admin" || user?.role === "requester";

  const filteredRequests = requests.filter((request) => {
    if (filter === "all") return true;
    return request.status === filter;
  });

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
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
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
            <button onClick={fetchRequests} className="btn btn-outline btn-sm">
              Retry
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
              All ({requests.length})
            </button>
            <button
              className={`btn btn-sm ${
                filter === "draft" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilter("draft")}
            >
              Draft ({requests.filter((r) => r.status === "draft").length})
            </button>
            <button
              className={`btn btn-sm ${
                filter === "submitted" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilter("submitted")}
            >
              Pending (
              {
                requests.filter(
                  (r) => r.status === "submitted" || r.status === "pending"
                ).length
              }
              )
            </button>
            <button
              className={`btn btn-sm ${
                filter === "approved" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilter("approved")}
            >
              Approved ({requests.filter((r) => r.status === "approved").length}
              )
            </button>
            <button
              className={`btn btn-sm ${
                filter === "rejected" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilter("rejected")}
            >
              Rejected ({requests.filter((r) => r.status === "rejected").length}
              )
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
                        <a
                          href={`/purchase-requests/${request._id}`}
                          className="btn btn-outline btn-sm"
                        >
                          View
                        </a>
                        {request.status === "draft" && canCreateRequest && (
                          <button className="btn btn-outline btn-sm">
                            Edit
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
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Your First Request
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      <CreateRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRequestCreated={handleRequestCreated}
      />
    </div>
  );
};

export default PurchaseRequests;
