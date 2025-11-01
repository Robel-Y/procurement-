import React, { useState, useEffect } from "react";
import { purchaseRequestService } from "../services/purchaseRequests";
import { bidService } from "../services/bidService";
import { formatCurrency, formatDate, getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";
import Modal from "../components/Modal";

const SupplierBids = () => {
  const [availableRequests, setAvailableRequests] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidForm, setBidForm] = useState({
    bidAmount: 0,
    deliveryTime: "",
    proposal: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsResponse, bidsResponse] = await Promise.all([
        purchaseRequestService.getBiddingRequests(),
        bidService.getAllBids({ supplier: "current" }), // Assuming supplier context
      ]);

      if (requestsResponse.success) {
        setAvailableRequests(requestsResponse.data || []);
      }
      if (bidsResponse.success) {
        setMyBids(bidsResponse.data || []);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (!bidForm.bidAmount || !bidForm.deliveryTime || !bidForm.proposal) {
      setError("Please fill in all fields");
      setSubmitting(false);
      return;
    }

    try {
      const bidData = {
        purchaseRequest: selectedRequest._id,
        bidAmount: parseFloat(bidForm.bidAmount),
        deliveryTime: bidForm.deliveryTime,
        proposal: bidForm.proposal,
      };

      const response = await bidService.submitBid(bidData);
      if (response.success) {
        setSuccess("Bid submitted successfully!");
        setBidModalOpen(false);
        setBidForm({ bidAmount: 0, deliveryTime: "", proposal: "" });
        fetchData(); // Refresh data
      } else {
        setError(response.error);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const openBidModal = (request) => {
    setSelectedRequest(request);
    setBidForm({
      bidAmount: request.budget * 0.9, // Default to 10% below budget
      deliveryTime: "14",
      proposal: "",
    });
    setBidModalOpen(true);
  };

  if (loading) {
    return (
      <div className="card text-center p-3">
        <Spinner size="lg" />
        <p>Loading bidding opportunities...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <div>
          <h1 className="card-title mb-1">Supplier Bidding</h1>
          <p style={{ color: "var(--text-light)" }}>
            Submit bids for available purchase requests
          </p>
        </div>
        <button onClick={fetchData} className="btn btn-outline">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div
          className="card mb-3"
          style={{ background: "var(--error)", color: "white" }}
        >
          <div className="p-3">{error}</div>
        </div>
      )}

      {success && (
        <div
          className="card mb-3"
          style={{ background: "var(--success)", color: "white" }}
        >
          <div className="p-3">{success}</div>
        </div>
      )}

      {/* Available Requests */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title mb-0">Available Requests</h3>
        </div>
        <div className="p-3">
          {availableRequests.length > 0 ? (
            <div className="grid grid-2">
              {availableRequests.map((request) => (
                <div key={request._id} className="card">
                  <div className="p-3">
                    <h4>{request.title}</h4>
                    <p
                      style={{
                        color: "var(--text-light)",
                        marginBottom: "1rem",
                      }}
                    >
                      {request.description}
                    </p>

                    <div className="grid grid-2 mb-2">
                      <div>
                        <strong>Budget:</strong>
                        <div>{formatCurrency(request.budget)}</div>
                      </div>
                      <div>
                        <strong>Category:</strong>
                        <div>{request.category}</div>
                      </div>
                      <div>
                        <strong>Quantity:</strong>
                        <div>{request.quantity}</div>
                      </div>
                      <div>
                        <strong>Department:</strong>
                        <div>{request.department}</div>
                      </div>
                    </div>

                    <div className="d-flex justify-between align-center mt-2">
                      <small style={{ color: "var(--text-light)" }}>
                        Posted {formatDate(request.updatedAt)}
                      </small>
                      <button
                        onClick={() => openBidModal(request)}
                        className="btn btn-primary btn-sm"
                      >
                        Submit Bid
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>No Available Requests</h3>
                <p>
                  There are no purchase requests available for bidding at the
                  moment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My Bids */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title mb-0">My Submitted Bids</h3>
        </div>
        <div className="p-3">
          {myBids.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Request Title</th>
                    <th>Bid Amount</th>
                    <th>Delivery Time</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {myBids.map((bid) => (
                    <tr key={bid._id}>
                      <td>
                        <strong>{bid.purchaseRequest?.title}</strong>
                      </td>
                      <td>{formatCurrency(bid.bidAmount)}</td>
                      <td>{bid.deliveryTime} days</td>
                      <td>
                        <span
                          className={`badge ${
                            bid.status === "accepted"
                              ? "badge-approved"
                              : bid.status === "rejected"
                              ? "badge-rejected"
                              : "badge-submitted"
                          }`}
                        >
                          {bid.status || "Pending"}
                        </span>
                      </td>
                      <td>{formatDate(bid.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-3">
              <p>You haven't submitted any bids yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bid Submission Modal */}
      <Modal
        isOpen={bidModalOpen}
        onClose={() => setBidModalOpen(false)}
        title={`Submit Bid: ${selectedRequest?.title}`}
      >
        {selectedRequest && (
          <form onSubmit={handleBidSubmit}>
            <div className="form-group">
              <label className="form-label">Bid Amount ($)</label>
              <input
                type="number"
                className="form-control"
                value={bidForm.bidAmount}
                onChange={(e) =>
                  setBidForm({ ...bidForm, bidAmount: e.target.value })
                }
                min="0"
                step="0.01"
                required
                disabled={submitting}
              />
              <small style={{ color: "var(--text-light)" }}>
                Request Budget: {formatCurrency(selectedRequest.budget)}
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Time (days)</label>
              <input
                type="number"
                className="form-control"
                value={bidForm.deliveryTime}
                onChange={(e) =>
                  setBidForm({ ...bidForm, deliveryTime: e.target.value })
                }
                min="1"
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Proposal Details</label>
              <textarea
                className="form-control"
                value={bidForm.proposal}
                onChange={(e) =>
                  setBidForm({ ...bidForm, proposal: e.target.value })
                }
                rows="4"
                required
                disabled={submitting}
                placeholder="Describe your proposal, including any value-added services, warranty information, or special terms..."
              />
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={() => setBidModalOpen(false)}
                className="btn btn-outline"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" />
                    Submitting...
                  </>
                ) : (
                  "Submit Bid"
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default SupplierBids;
