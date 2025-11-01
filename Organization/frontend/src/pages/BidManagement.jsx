import React, { useState, useEffect } from "react";
import { purchaseRequestService } from "../services/purchaseRequests";
import { bidService } from "../services/bidService";
import { formatCurrency, formatDate, getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";
import Modal from "../components/Modal";

const BidManagement = () => {
  const [biddingRequests, setBiddingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bids, setBids] = useState([]);
  const [topBids, setTopBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBiddingRequests();
  }, []);

  const fetchBiddingRequests = async () => {
    try {
      setLoading(true);
      const response = await purchaseRequestService.getBiddingRequests();
      if (response.success) {
        setBiddingRequests(response.data || []);
      } else {
        setError(response.error);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async (requestId) => {
    try {
      setActionLoading(`bids-${requestId}`);
      const [bidsResponse, topBidsResponse] = await Promise.all([
        bidService.getBidsByRequest(requestId),
        bidService.getTopBids(requestId),
      ]);

      if (bidsResponse.success && topBidsResponse.success) {
        setBids(bidsResponse.data || []);
        setTopBids(topBidsResponse.data || []);
        setModalOpen(true);
      } else {
        setError("Failed to fetch bids");
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectBid = async (bidId) => {
    try {
      setActionLoading(`select-${bidId}`);
      const response = await bidService.selectWinningBid(
        bidId,
        selectedRequest._id
      );
      if (response.success) {
        // Mark purchase request as ordered
        const orderResponse = await purchaseRequestService.markAsOrdered(
          selectedRequest._id,
          bidId
        );
        if (orderResponse.success) {
          setModalOpen(false);
          fetchBiddingRequests(); // Refresh the list
        } else {
          setError(orderResponse.error);
        }
      } else {
        setError(response.error);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "badge-draft";
      case "submitted":
        return "badge-submitted";
      case "approved":
        return "badge-approved";
      case "rejected":
        return "badge-rejected";
      case "ordered":
        return "badge-approved";
      default:
        return "badge-draft";
    }
  };

  if (loading) {
    return (
      <div className="card text-center p-3">
        <Spinner size="lg" />
        <p>Loading bidding requests...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <div>
          <h1 className="card-title mb-1">Bid Management</h1>
          <p style={{ color: "var(--text-light)" }}>
            Manage supplier bids and select winning proposals
          </p>
        </div>
        <button onClick={fetchBiddingRequests} className="btn btn-outline">
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

      <div className="card">
        <div className="card-header">
          <h3 className="card-title mb-0">
            Approved Requests Ready for Bidding
          </h3>
        </div>

        {biddingRequests.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Department</th>
                  <th>Approved Date</th>
                  <th>Bids Received</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {biddingRequests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <strong>{request.title}</strong>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-light)",
                        }}
                      >
                        {request.description?.substring(0, 60)}...
                      </div>
                    </td>
                    <td>{request.category}</td>
                    <td>{formatCurrency(request.budget)}</td>
                    <td>{request.department}</td>
                    <td>{formatDate(request.updatedAt)}</td>
                    <td>
                      <span className="badge badge-submitted">
                        {request.bidCount || 0} Bids
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          fetchBids(request._id);
                        }}
                        className="btn btn-primary btn-sm"
                        disabled={actionLoading === `bids-${request._id}`}
                      >
                        {actionLoading === `bids-${request._id}` ? (
                          <Spinner size="sm" />
                        ) : (
                          "View Bids"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h3>No Bidding Requests</h3>
              <p>
                There are no approved requests ready for bidding at the moment.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bid Selection Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Bids for: ${selectedRequest?.title}`}
        size="lg"
      >
        {selectedRequest && (
          <div>
            {/* Request Details */}
            <div className="card mb-3">
              <div className="p-3">
                <h4>Request Details</h4>
                <div className="grid grid-3">
                  <div>
                    <strong>Budget:</strong>{" "}
                    {formatCurrency(selectedRequest.budget)}
                  </div>
                  <div>
                    <strong>Category:</strong> {selectedRequest.category}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {selectedRequest.quantity}
                  </div>
                </div>
                <p className="mt-2">{selectedRequest.description}</p>
              </div>
            </div>

            {/* Top 5 Bids (Algorithm Results) */}
            <div className="card mb-3">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  🏆 Top 5 Bids (Algorithm Recommended)
                </h5>
              </div>
              <div className="p-3">
                {topBids.length > 0 ? (
                  <div className="space-y-3">
                    {topBids.map((bid, index) => (
                      <div
                        key={bid._id}
                        className={`p-3 border rounded ${
                          index === 0
                            ? "border-warning bg-yellow-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="d-flex justify-between align-center">
                          <div>
                            <div className="d-flex align-center gap-2 mb-1">
                              <span className="badge bg-warning">
                                #{index + 1}
                              </span>
                              <strong>{bid.supplier?.companyName}</strong>
                            </div>
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--text-light)",
                              }}
                            >
                              Bid: {formatCurrency(bid.bidAmount)} • Delivery:{" "}
                              {bid.deliveryTime} days • Rating:{" "}
                              {bid.supplier?.rating}/5
                            </div>
                            {bid.proposal && (
                              <p
                                style={{
                                  fontSize: "0.875rem",
                                  marginTop: "0.5rem",
                                }}
                              >
                                {bid.proposal}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleSelectBid(bid._id)}
                            className="btn btn-success btn-sm"
                            disabled={actionLoading === `select-${bid._id}`}
                          >
                            {actionLoading === `select-${bid._id}` ? (
                              <Spinner size="sm" />
                            ) : (
                              "Select"
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-3">
                    <p>No bids received yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* All Bids */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">All Bids ({bids.length})</h5>
              </div>
              <div className="p-3">
                {bids.length > 0 ? (
                  <div className="space-y-2">
                    {bids.map((bid) => (
                      <div key={bid._id} className="p-2 border rounded">
                        <div className="d-flex justify-between align-center">
                          <div>
                            <strong>{bid.supplier?.companyName}</strong>
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--text-light)",
                              }}
                            >
                              {formatCurrency(bid.bidAmount)} •{" "}
                              {bid.deliveryTime} days
                            </div>
                          </div>
                          <span
                            className={`badge ${
                              topBids.some((tb) => tb._id === bid._id)
                                ? "badge-approved"
                                : "badge-draft"
                            }`}
                          >
                            {topBids.some((tb) => tb._id === bid._id)
                              ? "Top 5"
                              : "Other"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-3">
                    <p>No bids have been submitted yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BidManagement;
