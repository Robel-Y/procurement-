import React, { useState, useEffect } from "react";
import { purchaseRequestService } from "../services/purchaseRequests";
import { userService } from "../services/userService";
import { formatCurrency, formatDate, getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalBudget: 0,
    totalUsers: 0,
    pendingApprovals: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all data for admin
      const [requestsResponse, usersResponse] = await Promise.all([
        purchaseRequestService.getAll(),
        userService.getUsers(),
      ]);
      console.log(requestsResponse);
      console.log(usersResponse);

      if (requestsResponse.success && usersResponse.success) {
        const allRequests = requestsResponse.data || [];
        const allUsers = usersResponse.data || [];

        // Calculate stats
        const totalRequests = allRequests.length;
        const pendingRequests = allRequests.filter(
          (req) => req.status === "submitted" || req.status === "pending"
        ).length;
        const approvedRequests = allRequests.filter(
          (req) => req.status === "approved"
        ).length;
        const rejectedRequests = allRequests.filter(
          (req) => req.status === "rejected"
        ).length;
        const totalBudget = allRequests.reduce(
          (sum, req) => sum + (req.budget || 0),
          0
        );
        const totalUsers = allUsers.length;
        const pendingApprovals = allRequests.filter(
          (req) => req.status === "submitted" || req.status === "pending"
        ).length;

        setStats({
          totalRequests,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          totalBudget,
          totalUsers,
          pendingApprovals,
        });

        // Get recent requests (last 5)
        const sortedRequests = allRequests
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setRecentRequests(sortedRequests);
      } else {
        setError("Failed to load dashboard data");
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
        <p className="mt-2">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <div>
          <h1 className="card-title mb-1">Admin Dashboard</h1>
          <p style={{ color: "var(--text-light)" }}>
            Complete system overview and administration
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

      {/* Admin-specific Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">📊 {stats.totalRequests}</div>
          <div className="stat-label">Total Requests</div>
        </div>

        <div
          className="stat-card"
          style={{ borderLeft: "4px solid var(--warning)" }}
        >
          <div className="stat-value">👀 {stats.pendingApprovals}</div>
          <div className="stat-label">Pending Approvals</div>
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
            💰 {formatCurrency(stats.totalBudget)}
          </div>
          <div className="stat-label">Total Budget</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">👥 {stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title mb-0">Recent System Activity</h2>
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
                  <th>Requested By</th>
                  <th>Department</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Date</th>
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
                    <td>{request.requestedBy?.name || "Unknown"}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No Activity</h3>
              <p>No purchase requests in the system yet.</p>
            </div>
          </div>
        )}
      </div>

      {/* Admin Quick Actions */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title mb-0">Admin Actions</h3>
        </div>
        <div className="p-3">
          <div className="d-flex gap-2 flex-wrap">
            <a href="/approvals" className="btn btn-warning">
              ✅ Review Approvals ({stats.pendingApprovals})
            </a>
            <a href="/users" className="btn btn-outline">
              👥 Manage Users
            </a>
            <a href="/suppliers" className="btn btn-outline">
              🏢 Manage Suppliers
            </a>
            <a href="/reports" className="btn btn-outline">
              📈 View Reports
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
