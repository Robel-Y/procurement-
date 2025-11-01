import React, { useState, useEffect } from "react";
import { purchaseRequestService } from "../services/purchaseRequests";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDate, getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";

const DashboardApprover = () => {
  const { user } = useAuth();
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

      // Fetch department-specific data for approver
      const [allRequestsResponse, pendingResponse] = await Promise.all([
        purchaseRequestService.getAll({ department: user.department }),
        purchaseRequestService.getAll({
          status: "submitted",
          department: user.department,
        }),
      ]);

      if (allRequestsResponse.success && pendingResponse.success) {
        const departmentRequests = allRequestsResponse.data || [];
        const pendingReqs = pendingResponse.data || [];

        // Calculate monthly stats
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyRequests = departmentRequests.filter((req) => {
          const reqDate = new Date(req.createdAt);
          return (
            reqDate.getMonth() === currentMonth &&
            reqDate.getFullYear() === currentYear
          );
        });

        const approvedThisMonth = monthlyRequests.filter(
          (req) => req.status === "approved"
        ).length;
        const rejectedThisMonth = monthlyRequests.filter(
          (req) => req.status === "rejected"
        ).length;
        const departmentBudget = monthlyRequests.reduce(
          (sum, req) => sum + (req.budget || 0),
          0
        );

        setStats({
          departmentRequests: departmentRequests.length,
          pendingApprovals: pendingReqs.length,
          approvedThisMonth,
          rejectedThisMonth,
          departmentBudget,
        });

        // Get pending requests for quick action
        setPendingRequests(pendingReqs.slice(0, 3));
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
            {user.department} Department • Review and approve purchase requests
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

      {/* Approver-specific Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">📋 {stats.departmentRequests}</div>
          <div className="stat-label">Department Requests</div>
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
          <div className="stat-value">⏳ {stats.pendingApprovals}</div>
          <div className="stat-label">Pending Approval</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">✅ {stats.approvedThisMonth}</div>
          <div className="stat-label">Approved This Month</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">❌ {stats.rejectedThisMonth}</div>
          <div className="stat-label">Rejected This Month</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">
            💰 {formatCurrency(stats.departmentBudget)}
          </div>
          <div className="stat-label">Monthly Budget</div>
        </div>
      </div>

      {/* Pending Approvals for Quick Action */}
      {stats.pendingApprovals > 0 && (
        <div className="card mb-3">
          <div className="card-header">
            <h2 className="card-title mb-0">
              Pending Approvals - Action Required
            </h2>
            <a href="/approvals" className="btn btn-warning btn-sm">
              Review All
            </a>
          </div>
          <div className="p-3">
            <div className="grid grid-3">
              {pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="card"
                  style={{ border: "2px solid var(--warning)" }}
                >
                  <div className="p-2">
                    <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                      {request.title}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-light)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {request.description?.substring(0, 60)}...
                    </p>
                    <div className="d-flex justify-between align-center">
                      <span style={{ fontWeight: "600" }}>
                        {formatCurrency(request.budget)}
                      </span>
                      <a href={`/approvals`} className="btn btn-warning btn-sm">
                        Review
                      </a>
                    </div>
                  </div>
                </div>
              ))}
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
            <a href="/approvals" className="btn btn-warning">
              ✅ Review Approvals ({stats.pendingApprovals})
            </a>
            <a href="/purchase-requests" className="btn btn-outline">
              📋 View Department Requests
            </a>
            <a href="/suppliers" className="btn btn-outline">
              🏢 View Suppliers
            </a>
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="card mt-3">
        <div className="card-header">
          <h3 className="card-title mb-0">Department Performance</h3>
        </div>
        <div className="p-3">
          <div className="grid grid-2">
            <div>
              <strong>Approval Rate</strong>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "var(--success)",
                }}
              >
                {stats.departmentRequests > 0
                  ? Math.round(
                      (stats.approvedThisMonth / stats.departmentRequests) * 100
                    )
                  : 0}
                %
              </div>
            </div>
            <div>
              <strong>Average Processing Time</strong>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "var(--info)",
                }}
              >
                2.3 days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardApprover;
