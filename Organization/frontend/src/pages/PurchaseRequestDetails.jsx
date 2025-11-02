import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { purchaseRequestService } from "../services/purchaseRequests";
import {
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
} from "../utils/helpers";
import Spinner from "../components/Spinner";

const PurchaseRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const response = await purchaseRequestService.getById(id);
      if (response.success) {
        setRequest(response.data);
      } else {
        setError(response.error || "Request not found");
      }
    } catch (error) {
      setError("Failed to load request details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await purchaseRequestService.submit(id);
      if (response.success) {
        await fetchRequestDetails(); // Refresh data
      } else {
        alert(response.error || "Failed to submit request");
      }
    } catch (error) {
      alert("Failed to submit request");
    }
  };

  if (loading) {
    return (
      <div className="card text-center p-3">
        <Spinner size="lg" />
        <p>Loading request details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center p-3">
        <div style={{ color: "var(--error)" }}>{error}</div>
        <button
          onClick={() => navigate("/purchase-requests")}
          className="btn btn-primary mt-2"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="card text-center p-3">
        <h3>Request Not Found</h3>
        <p>The purchase request you're looking for doesn't exist.</p>
        <Link to="/purchase-requests" className="btn btn-primary">
          Back to Requests
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header mb-3">
        <div className="d-flex justify-between align-center">
          <div>
            <h1 className="card-title mb-0">{request.title}</h1>
            <div className="d-flex align-center gap-2 mt-1">
              <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                {request.status}
              </span>
              <span style={{ color: "var(--text-light)" }}>
                Created {formatDate(request.createdAt)}
              </span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => navigate("/purchase-requests")}
              className="btn btn-outline"
            >
              Back
            </button>
            {request.status === "draft" && (
              <button onClick={handleSubmit} className="btn btn-primary">
                Submit for Approval
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <h3 className="card-title">Request Details</h3>
        <div
          className="grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div>
            <strong>Description</strong>
            <p>{request.description}</p>
          </div>
          <div>
            <strong>Category</strong>
            <p>{request.category || "General"}</p>
          </div>
          <div>
            <strong>Quantity</strong>
            <p>{request.quantity}</p>
          </div>
          <div>
            <strong>Budget</strong>
            <p>{formatCurrency(request.budget)}</p>
          </div>
          <div>
            <strong>Urgency</strong>
            <p style={{ textTransform: "capitalize" }}>{request.urgency}</p>
          </div>
          <div>
            <strong>Department</strong>
            <p>{request.department || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Approval History */}
      {request.approvalHistory && request.approvalHistory.length > 0 && (
        <div className="card">
          <h3 className="card-title">Approval History</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Approver</th>
                <th>Status</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {request.approvalHistory.map((history, index) => (
                <tr key={index}>
                  <td>{formatDate(history.date)}</td>
                  <td>{history.approver?.name || "System"}</td>
                  <td>
                    <span
                      className={`badge ${getStatusBadgeClass(history.status)}`}
                    >
                      {history.status}
                    </span>
                  </td>
                  <td>{history.comments || "No comments"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequestDetails;
