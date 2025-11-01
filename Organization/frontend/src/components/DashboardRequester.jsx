import React, { useState, useEffect } from "react";
import { purchaseRequestService } from "../services/purchaseRequests";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate, getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";

const DashboardRequester = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalSpent: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch user's requests
      const response = await purchaseRequestService.getAll();

      if (response.success) {
        const allRequests = response.data || [];

        // Filter to only show current user's requests
        const myRequests = allRequests.filter(
          (req) =>
            req.requestedBy?._id === user._id || req.requestedBy === user._id
        );

        // Calculate stats
        const pendingRequests = myRequests.filter(
          (req) => req.status === "submitted" || req.status === "pending"
        ).length;
        const approvedRequests = myRequests.filter(
          (req) => req.status === "approved"
        ).length;
        const rejectedRequests = myRequests.filter(
          (req) => req.status === "rejected"
        ).length;
        const totalSpent = myRequests
          .filter((req) => req.status === "approved")
          .reduce((sum, req) => sum + (req.budget || 0), 0);

        setStats({
          myRequests: myRequests.length,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          totalSpent,
        });

        // Get recent requests (last 5)
        const sortedRequests = myRequests
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentRequests(sortedRequests);
      } else {
        setError(response.error || "Failed to load dashboard data");
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="card text-center p-3">
        <Spinner size="lg" />
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <div>
          <h1 className="card-title mb-1">My Procurement Dashboard</h1>
          <p style={{ color: "var(--text-light)" }}>
            Track your purchase requests and approvals
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn btn-outline"
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : "🔄 Refresh"}
        </button>
      </div>

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
            <div className="d-flex justify-between align-center">
              <div>
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={fetchDashboardData}
                className="btn btn-outline btn-sm"
                style={{ background: "white", color: "var(--error)" }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requester-specific Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">📋 {stats.myRequests}</div>
          <div className="stat-label">My Requests</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">⏳ {stats.pendingRequests}</div>
          <div className="stat-label">Pending Review</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">✅ {stats.approvedRequests}</div>
          <div className="stat-label">Approved</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">❌ {stats.rejectedRequests}</div>
          <div className="stat-label">Rejected</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            💰 {formatCurrency(stats.totalSpent)}
          </div>
          <div className="stat-label">Total Approved</div>
        </div>
      </div>

      {/* My Recent Requests */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title mb-0">My Recent Requests</h2>
          <a href="/purchase-requests" className="btn btn-outline btn-sm">
            View All
          </a>
        </div>

        {recentRequests.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => (
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
                          {request.description.substring(0, 50)}...
                        </div>
                      )}
                    </td>
                    <td>{request.category || "N/A"}</td>
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
                      {request.status === "draft" && (
                        <a
                          href={`/purchase-requests/${request._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Submit
                        </a>
                      )}
                      {request.status === "submitted" && (
                        <span
                          style={{
                            color: "var(--text-light)",
                            fontSize: "0.875rem",
                          }}
                        >
                          Under Review
                        </span>
                      )}
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
              <h3>No Purchase Requests</h3>
              <p>You haven't created any purchase requests yet.</p>
              <a
                href="/create-purchase-request"
                className="btn btn-primary mt-2"
              >
                Create Your First Request
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions for Requester */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title mb-0">Quick Actions</h3>
        </div>
        <div className="p-3">
          <div className="d-flex gap-2 flex-wrap">
            <a href="/create-purchase-request" className="btn btn-primary">
              📝 Create New Request
            </a>
            <a href="/purchase-requests" className="btn btn-outline">
              📋 View My Requests
            </a>
            <a href="/suppliers" className="btn btn-outline">
              🏢 View Suppliers
            </a>
          </div>
        </div>
      </div>

      {/* Request Tips */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title mb-0">📝 Request Tips</h3>
        </div>
        <div className="p-3">
          <div className="grid grid-2">
            <div>
              <h4>✅ Best Practices</h4>
              <ul
                style={{
                  paddingLeft: "1.5rem",
                  color: "var(--text-secondary)",
                }}
              >
                <li>Provide detailed descriptions</li>
                <li>Include specific quantities</li>
                <li>Add vendor recommendations</li>
                <li>Set realistic urgency levels</li>
              </ul>
            </div>
            <div>
              <h4>🚀 Quick Approval</h4>
              <ul
                style={{
                  paddingLeft: "1.5rem",
                  color: "var(--text-secondary)",
                }}
              >
                <li>Clear budget justification</li>
                <li>Proper category selection</li>
                <li>Accurate cost estimates</li>
                <li>Business need explanation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRequester;
