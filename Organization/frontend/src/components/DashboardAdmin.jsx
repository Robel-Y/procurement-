import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { purchaseRequestService } from "../services/purchaseRequests";
import { userService } from "../services/userService";
import { formatCurrency, formatDate, getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";
import Icon from "../components/Icon";

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

      // Extract arrays safely
      const allRequests = Array.isArray(requestsResponse?.data?.data)
        ? requestsResponse.data.data
        : [];
      const allUsersRaw = usersResponse?.data || {};
      const allUsers = Array.isArray(allUsersRaw)
        ? allUsersRaw
        : Array.isArray(allUsersRaw.data)
        ? allUsersRaw.data
        : Array.isArray(allUsersRaw.items)
        ? allUsersRaw.items
        : [];

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
      const pendingApprovals = pendingRequests;

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
      const sortedRequests = [...allRequests]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentRequests(sortedRequests);
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
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Icon name="refresh" />
              <span style={{ marginLeft: 8 }}>Refresh</span>
            </>
          )}
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
          <div className="stat-value">
            <Icon name="bar" size={20} />
            <span style={{ marginLeft: 8 }}>{stats.totalRequests}</span>
          </div>
          <div className="stat-label">Total Requests</div>
        </div>

        <div
          className="stat-card"
          style={{ borderLeft: "4px solid var(--warning)" }}
        >
          <div className="stat-value">
            <Icon name="bell" size={20} />
            <span style={{ marginLeft: 8 }}>{stats.pendingApprovals}</span>
          </div>
          <div className="stat-label">Pending Approvals</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            <Icon name="check" size={20} />
            <span style={{ marginLeft: 8 }}>{stats.approvedRequests}</span>
          </div>
          <div className="stat-label">Approved</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            <Icon name="trash" size={20} />
            <span style={{ marginLeft: 8 }}>{stats.rejectedRequests}</span>
          </div>
          <div className="stat-label">Rejected</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            <Icon name="download" size={18} />
            <span style={{ marginLeft: 8 }}>
              {formatCurrency(stats.totalBudget)}
            </span>
          </div>
          <div className="stat-label">Total Budget</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            <Icon name="users" size={18} />
            <span style={{ marginLeft: 8 }}>{stats.totalUsers}</span>
          </div>
          <div className="stat-label">Total Users</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title mb-0">Recent System Activity</h2>
          <Link to="/purchase-requests" className="btn btn-outline btn-sm">
            View All
          </Link>
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
              <div className="empty-state-icon">
                <Icon name="file" size={28} />
              </div>
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
            <Link to="/approvals" className="btn btn-warning">
              <Icon name="check" />
              <span style={{ marginLeft: 8 }}>
                Review Approvals ({stats.pendingApprovals})
              </span>
            </Link>
            <Link to="/users" className="btn btn-outline">
              <Icon name="users" />
              <span style={{ marginLeft: 8 }}>Manage Users</span>
            </Link>

            <Link to="/reports" className="btn btn-outline">
              <Icon name="chart" />
              <span style={{ marginLeft: 8 }}>View Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
