import React, { useState, useEffect } from "react";
import { purchaseRequestService } from "../services/purchaseRequests";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate, getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";
import Icon from "../components/Icon";
import { useNavigate } from "react-router-dom";

const DashboardRequester = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

      console.log("🔄 Fetching requester dashboard data for user:", user?._id);

      const response = await purchaseRequestService.getAll();
      console.log("📊 Requester API Response:", response);

      if (response.success) {
        const allRequests = response.data?.data || response.data || [];

        if (!Array.isArray(allRequests)) {
          setError("Invalid data format received from server");
          return;
        }

        // Filter user's requests - handle both object ID and string ID
        const myRequests = allRequests.filter((req) => {
          const requestedById = req.requestedBy?._id || req.requestedBy;
          const userId = user?._id;
          console.log(
            `🔍 Comparing: Request ${
              req._id
            } - RequestedBy: ${requestedById}, User: ${userId}, Match: ${
              requestedById === userId
            }`
          );
          return requestedById === userId;
        });

        console.log("👤 My filtered requests:", myRequests);

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
          .reduce((sum, req) => sum + (parseFloat(req.budget) || 0), 0);

        setStats({
          myRequests: myRequests.length,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          totalSpent,
        });

        // Get recent requests
        const sortedRequests = myRequests
          .sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          )
          .slice(0, 5);

        setRecentRequests(sortedRequests);
      } else {
        setError(response.error || "Failed to load dashboard data");
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      console.error("❌ Requester dashboard error:", error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Create request function
  const handleCreateRequest = () => {
    console.log("🎯 Creating new purchase request...");

    // Try multiple possible routes
    const possibleRoutes = [
      "/create-purchase-request",
      "/purchase-requests/create",
      "/purchase-requests/new",
    ];

    // Check which route exists by trying them
    const createRoute = "/create-purchase-request"; // Use the most common one

    console.log(`📍 Navigating to: ${createRoute}`);
    navigate(createRoute);
  };

  const handleViewRequest = (requestId) => {
    if (requestId) {
      navigate(`/purchase-requests/${requestId}`);
    } else {
      setError("Invalid request ID");
    }
  };

  const handleSubmitRequest = (requestId) => {
    if (requestId) {
      navigate(`/purchase-requests/${requestId}?action=submit`);
    }
  };

  const handleViewAllRequests = () => {
    navigate("/purchase-requests");
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

  const getStatusDisplayText = (status) => {
    if (!status) return "Draft";

    switch (status.toLowerCase()) {
      case "submitted":
        return "Under Review";
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "ordered":
        return "Ordered";
      default:
        return "Draft";
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
            Welcome back, {user?.name}! Track your purchase requests and
            approvals
          </p>
          <div style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
            User ID: {user?._id} • Role: {user?.role} • Department:{" "}
            {user?.department}
          </div>
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

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">
            <Icon name="file" size={20} />
            <span style={{ marginLeft: 8 }}>{stats.myRequests}</span>
          </div>
          <div className="stat-label">Total Requests</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            <Icon name="clock" size={20} />
            <span style={{ marginLeft: 8 }}>{stats.pendingRequests}</span>
          </div>
          <div className="stat-label">Pending Review</div>
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
              {formatCurrency(stats.totalSpent)}
            </span>
          </div>
          <div className="stat-label">Total Approved</div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title mb-0">My Recent Requests</h2>
          <button
            onClick={handleViewAllRequests}
            className="btn btn-outline btn-sm"
          >
            View All
          </button>
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
                      <strong>{request.title || "Untitled Request"}</strong>
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
                        {getStatusDisplayText(request.status)}
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
                        {request.status === "draft" && (
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
              <h3>No Purchase Requests</h3>
              <p>You haven't created any purchase requests yet.</p>
              <button
                onClick={handleCreateRequest}
                className="btn btn-primary mt-2"
              >
                ➕ Create Your First Request
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title mb-0">Quick Actions</h3>
        </div>
        <div className="p-3">
          <div className="d-flex gap-2 flex-wrap">
            <button onClick={handleCreateRequest} className="btn btn-primary">
              📝 Create New Request
            </button>
            <button onClick={handleViewAllRequests} className="btn btn-outline">
              📋 View My Requests
            </button>
            
          </div>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title mb-0">🛠️ Debug Information</h3>
        </div>
        <div className="p-3">
          <div style={{ fontSize: "0.875rem" }}>
            <strong>User Info:</strong>
            <br />
            ID: {user?._id}
            <br />
            Name: {user?.name}
            <br />
            Role: {user?.role}
            <br />
            Department: {user?.department}
          </div>
          <button
            onClick={handleCreateRequest}
            className="btn btn-outline btn-sm mt-2"
          >
            Test Create Navigation
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardRequester;
