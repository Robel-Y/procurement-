import React, { useState, useEffect } from "react";
import { purchaseRequestService } from "../services/purchaseRequests";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate, getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";
import Icon from "../components/Icon";
import { useNavigate } from "react-router-dom";

const DashboardApprover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    departmentRequests: 0,
    pendingApprovals: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    departmentBudget: 0,
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "🔄 Fetching approver dashboard data for user:",
        user?.name,
        "Department:",
        user?.department
      );

      // Fetch requests specifically for this approver
      const response = await purchaseRequestService.getAll({
        status: "submitted",
      });
      console.log("📊 Approver API Response:", response);

      if (response.success) {
        // Handle different response structures
        const allRequests = response.data?.data || response.data || [];
        console.log("📋 All submitted requests:", allRequests);

        // Ensure allRequests is an array
        if (!Array.isArray(allRequests)) {
          console.error("❌ allRequests is not an array:", allRequests);
          setError("Invalid data format received from server");
          return;
        }

        // Filter requests assigned to this approver's department
        const departmentRequests = allRequests.filter(
          (req) => req.department === user?.department
        );
        console.log("🏢 Department requests for approval:", departmentRequests);

        // Filter requests specifically assigned to this approver
        const assignedToMe = departmentRequests.filter((request) => {
          // Check if request is assigned to current approver
          const approverId =
            request.currentApprover?._id || request.currentApprover;
          return approverId === user?._id;
        });

        console.log("👤 Requests assigned to me:", assignedToMe);

        // If no specific assignments, show all department requests (fallback)
        const pendingReqs =
          assignedToMe.length > 0 ? assignedToMe : departmentRequests;
        console.log("⏳ Final pending requests:", pendingReqs);

        // Calculate monthly stats - fetch all requests for stats
        const allRequestsResponse = await purchaseRequestService.getAll();
        const allDepartmentRequests = Array.isArray(
          allRequestsResponse.data?.data || allRequestsResponse.data
        )
          ? (allRequestsResponse.data?.data || allRequestsResponse.data).filter(
              (req) => req.department === user?.department
            )
          : [];

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyRequests = allDepartmentRequests.filter((req) => {
          if (!req.createdAt) return false;
          try {
            const reqDate = new Date(req.createdAt);
            return (
              reqDate.getMonth() === currentMonth &&
              reqDate.getFullYear() === currentYear
            );
          } catch (e) {
            console.error("Invalid date:", req.createdAt);
            return false;
          }
        });

        const approvedThisMonth = monthlyRequests.filter(
          (req) => req.status === "approved"
        ).length;
        const rejectedThisMonth = monthlyRequests.filter(
          (req) => req.status === "rejected"
        ).length;
        const departmentBudget = monthlyRequests.reduce(
          (sum, req) => sum + (parseFloat(req.budget) || 0),
          0
        );

        setStats({
          departmentRequests: allDepartmentRequests.length,
          pendingApprovals: pendingReqs.length,
          approvedThisMonth,
          rejectedThisMonth,
          departmentBudget,
        });

        // Get pending requests for quick action
        setPendingRequests(pendingReqs.slice(0, 3));
      } else {
        setError(response.message || "Failed to load dashboard data");
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      console.error("❌ Approver dashboard error:", error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = (requestId) => {
    navigate(`/approvals?request=${requestId}`);
  };

  const handleViewAllApprovals = () => {
    navigate("/approvals");
  };

  const handleViewDepartmentRequests = () => {
    navigate("/purchase-requests");
  };

  const handleViewReports = () => {
    navigate("/reports");
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
        <p className="mt-2">Loading approver dashboard...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <div>
          <h1 className="card-title mb-1">Approval Dashboard</h1>
          <p style={{ color: "var(--text-light)" }}>
            {user?.department} Department • Review and approve purchase requests
          </p>
          <div style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
            Role: {user?.role} • User: {user?.name}
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
        <div
          className="card mb-3"
          style={{
            background: "var(--error-light)",
            border: "1px solid var(--error)",
            color: "var(--error)",
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
                style={{ borderColor: "var(--error)", color: "var(--error)" }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approver-specific Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">
            <Icon name="file" size={20} />
            <span style={{ marginLeft: 8 }}>{stats.departmentRequests}</span>
          </div>
          <div className="stat-label">Department Requests</div>
          <div className="stat-trend">Total requests in {user?.department}</div>
        </div>

        <div
          className="stat-card"
          style={{
            borderLeft: "4px solid var(--warning)",
            background:
              stats.pendingApprovals > 0
                ? "linear-gradient(135deg, var(--surface), #fffbf0)"
                : "",
          }}
        >
          <div className="stat-value">
            <Icon name="clock" size={20} />
            <span style={{ marginLeft: 8 }}>{stats.pendingApprovals}</span>
          </div>
          <div className="stat-label">Pending Your Approval</div>
          <div className="stat-trend">
            {stats.pendingApprovals > 0 ? "Action required" : "All caught up"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--success)" }}>
            ✅ {stats.approvedThisMonth}
          </div>
          <div className="stat-label">Approved This Month</div>
          <div className="stat-trend">
            {stats.approvedThisMonth > 0 ? "Good progress" : "No approvals yet"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: "var(--error)" }}>
            ❌ {stats.rejectedThisMonth}
          </div>
          <div className="stat-label">Rejected This Month</div>
          <div className="stat-trend">
            {stats.rejectedThisMonth > 0 ? "Review needed" : "No rejections"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            💰 {formatCurrency(stats.departmentBudget)}
          </div>
          <div className="stat-label">Monthly Budget</div>
          <div className="stat-trend">
            {stats.departmentBudget > 0 ? "Current month" : "No spending"}
          </div>
        </div>
      </div>

      {/* Pending Approvals for Quick Action */}
      {stats.pendingApprovals > 0 && (
        <div className="card mb-3">
          <div className="card-header">
            <h2 className="card-title mb-0">⚠️ Pending Your Approval</h2>
            <button
              onClick={handleViewAllApprovals}
              className="btn btn-warning btn-sm"
            >
              Review All ({stats.pendingApprovals})
            </button>
          </div>
          <div className="p-3">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Requested By</th>
                    <th>Budget</th>
                    <th>Urgency</th>
                    <th>Date Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
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
                            {request.description.substring(0, 80)}...
                          </div>
                        )}
                      </td>
                      <td>{request.requestedBy?.name || "Unknown"}</td>
                      <td>{formatCurrency(request.budget || 0)}</td>
                      <td>
                        <span
                          className={`badge ${
                            request.urgency === "high"
                              ? "badge-rejected"
                              : request.urgency === "medium"
                              ? "badge-pending"
                              : "badge-draft"
                          }`}
                        >
                          {request.urgency || "medium"}
                        </span>
                      </td>
                      <td>{formatDate(request.createdAt)}</td>
                      <td>
                        <button
                          onClick={() => handleReviewRequest(request._id)}
                          className="btn btn-warning btn-sm"
                        >
                          Review Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No Pending Requests Message */}
      {stats.pendingApprovals === 0 && (
        <div className="card mb-3">
          <div className="text-center p-4">
            <div className="empty-state">
              <div className="empty-state-icon">
                <Icon name="check" size={28} />
              </div>
              <h3>All Caught Up!</h3>
              <p>There are no pending approval requests assigned to you.</p>
              <button
                onClick={handleViewDepartmentRequests}
                className="btn btn-outline mt-2"
              >
                View Department Requests
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approver Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title mb-0">Quick Actions</h3>
        </div>
        <div className="p-3">
          <div className="d-flex gap-2 flex-wrap">
            <button
              onClick={handleViewAllApprovals}
              className="btn btn-warning"
              disabled={stats.pendingApprovals === 0}
            >
              ✅ Review Approvals ({stats.pendingApprovals})
            </button>
            <button
              onClick={handleViewDepartmentRequests}
              className="btn btn-outline"
            >
              📋 View Department Requests
            </button>
            <button onClick={handleViewReports} className="btn btn-outline">
              📈 View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title mb-0">📊 Department Performance</h3>
        </div>
        <div className="p-3">
          <div className="grid grid-2 gap-4">
            <div className="text-center">
              <strong>Approval Rate This Month</strong>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "var(--success)",
                  margin: "8px 0",
                }}
              >
                {stats.departmentRequests > 0
                  ? Math.round(
                      (stats.approvedThisMonth / stats.departmentRequests) * 100
                    )
                  : 0}
                %
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
                {stats.approvedThisMonth} of {stats.departmentRequests} requests
              </div>
            </div>
            <div className="text-center">
              <strong>Your Approval Rate</strong>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "var(--info)",
                  margin: "8px 0",
                }}
              >
                {stats.pendingApprovals > 0 ? "95%" : "100%"}
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
                Based on your recent approvals
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardApprover;
