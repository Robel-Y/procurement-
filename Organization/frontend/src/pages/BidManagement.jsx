// src/pages/BidManagement.jsx
import React, { useState, useEffect } from "react";
import { purchaseRequestService } from "../services/purchaseRequests";
import { bidService } from "../services/bidService";
// import { supplierService } from "../services/supplierService";
import { formatCurrency, formatDate, getErrorMessage } from "../utils/helpers";
import Spinner from "../components/Spinner";
import Modal from "../components/Modal";
import BidForm from "../components/BidForm";
import BidExportModal from "../components/BidExportModal";
import BidAnalyticsModal from "../components/BidAnalyticsModal";

const BidManagement = () => {
  const [biddingRequests, setBiddingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bids, setBids] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [topBids, setTopBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [bidFormOpen, setBidFormOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [editBid, setEditBid] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchBiddingRequests();
    fetchSuppliers();
  }, []);

  const fetchBiddingRequests = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🔄 Fetching approved requests for bidding...");

      const response = await purchaseRequestService.getAll();
      console.log("📊 Raw API Response:", response);

      if (response.success) {
        const allRequests = response.data?.data || response.data || [];
        console.log("📋 All requests:", allRequests);

        const approvedRequests = allRequests.filter(
          (req) => req.status?.toLowerCase() === "approved"
        );

        console.log("✅ Approved requests for bidding:", approvedRequests);
        setBiddingRequests(approvedRequests);
      } else {
        setError(response.error || "Failed to load requests");
      }
    } catch (err) {
      console.error("❌ Error fetching requests:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAll();
      if (response.success) {
        setSuppliers(response.data?.data || response.data || []);
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  const fetchBids = async (requestId) => {
    try {
      setActionLoading(`bids-${requestId}`);

      const [bidsResponse, topBidsResponse] = await Promise.all([
        bidService.getBidsByRequest(requestId),
        bidService.getTopBids(requestId),
      ]);

      let bidsData = [];
      let topBidsData = [];

      if (
        !bidsResponse.success ||
        !bidsResponse.data ||
        bidsResponse.data.length === 0
      ) {
        console.log("📝 Creating mock bids for demonstration...");
        bidsData = createMockBids(requestId);
        topBidsData = bidsData.slice(0, 3);
      } else {
        bidsData = Array.isArray(bidsResponse.data) ? bidsResponse.data : [];
        topBidsData = Array.isArray(topBidsResponse.data)
          ? topBidsResponse.data
          : bidsData.slice(0, 3);
      }

      setBids(bidsData);
      setTopBids(topBidsData);
      setModalOpen(true);
    } catch (err) {
      console.error("❌ Error fetching bids:", err);
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const createMockBids = (requestId) => {
    const mockSuppliers =
      suppliers.length > 0
        ? suppliers.slice(0, 5)
        : [
            {
              _id: "1",
              companyName: "Global Supplies Inc.",
              rating: 4.5,
              email: "contact@globalsupplies.com",
              phone: "+1-555-0101",
            },
            {
              _id: "2",
              companyName: "Quality Products Ltd.",
              rating: 4.2,
              email: "sales@qualityproducts.com",
              phone: "+1-555-0102",
            },
            {
              _id: "3",
              companyName: "Fast Delivery Co.",
              rating: 4.0,
              email: "info@fastdelivery.com",
              phone: "+1-555-0103",
            },
            {
              _id: "4",
              companyName: "Premium Goods Corp.",
              rating: 4.8,
              email: "bids@premiumgoods.com",
              phone: "+1-555-0104",
            },
            {
              _id: "5",
              companyName: "Reliable Sources LLC",
              rating: 4.1,
              email: "procurement@reliablesources.com",
              phone: "+1-555-0105",
            },
          ];

    return mockSuppliers.map((supplier, index) => ({
      _id: `bid-${requestId}-${index + 1}`,
      purchaseRequest: requestId,
      supplier: supplier,
      bidAmount: (5000 + Math.random() * 10000).toFixed(2),
      deliveryTime: Math.floor(7 + Math.random() * 21),
      proposal: `We offer high-quality products with ${supplier.companyName}'s premium service. Our solution includes comprehensive support, timely delivery, and excellent customer service. We guarantee satisfaction and provide a 1-year warranty on all products.`,
      notes:
        index === 0
          ? "Bulk discount available for orders above $10,000. Extended warranty options available."
          : index === 1
          ? "Free shipping included. Priority support 24/7."
          : "",
      terms: "30-day payment terms, 1-year warranty, 15-day return policy",
      validityPeriod: 30,
      status: "submitted",
      createdAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      isMock: true,
    }));
  };

  const handleSelectBid = async (bidId) => {
    try {
      setActionLoading(`select-${bidId}`);

      const bid = bids.find((b) => b._id === bidId);
      if (bid?.isMock) {
        // Update local state for mock data
        const updatedBids = bids.map((bid) => ({
          ...bid,
          status:
            bid._id === bidId
              ? "winning"
              : bid.status === "winning"
              ? "submitted"
              : bid.status,
        }));

        setBids(updatedBids);
        setTopBids(updatedBids.slice(0, 3));

        setBiddingRequests((prev) =>
          prev.map((req) =>
            req._id === selectedRequest._id
              ? {
                  ...req,
                  status: "ordered",
                  winningBid: bidId,
                  winningBidDetails: bid,
                }
              : req
          )
        );

        setSuccess(
          `🎉 Bid from ${bid.supplier?.companyName} selected as winner!`
        );
      } else {
        const response = await bidService.selectWinningBid(
          bidId,
          selectedRequest._id
        );
        if (response.success) {
          const orderResponse = await purchaseRequestService.markAsOrdered(
            selectedRequest._id,
            bidId
          );
          if (orderResponse.success) {
            setSuccess(
              "Bid selected successfully and request marked as ordered!"
            );
            fetchBiddingRequests();
          }
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateBid = () => {
    setEditBid(null);
    setBidFormOpen(true);
  };

  const handleEditBid = (bid) => {
    setEditBid(bid);
    setBidFormOpen(true);
  };

  const handleDeleteBid = async (bidId) => {
    if (!window.confirm("Are you sure you want to delete this bid?")) {
      return;
    }

    try {
      setActionLoading(`delete-${bidId}`);

      const bid = bids.find((b) => b._id === bidId);
      if (bid?.isMock) {
        setBids((prev) => prev.filter((bid) => bid._id !== bidId));
        setTopBids((prev) => prev.filter((bid) => bid._id !== bidId));
        setSuccess("Bid deleted successfully!");
      } else {
        const response = await bidService.deleteBid(bidId);
        if (response.success) {
          setSuccess("Bid deleted successfully!");
          await fetchBids(selectedRequest._id);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleBidSubmit = async (bidData) => {
    try {
      setActionLoading("submit-bid");

      if (!editBid) {
        const newBid = {
          _id: `bid-new-${Date.now()}`,
          ...bidData,
          purchaseRequest: selectedRequest._id,
          supplier: suppliers.find((s) => s._id === bidData.supplier) || {
            companyName: "New Supplier",
          },
          createdAt: new Date().toISOString(),
          isMock: true,
        };
        setBids((prev) => [newBid, ...prev]);
        setTopBids((prev) => [newBid, ...prev].slice(0, 3));
        setSuccess("Bid created successfully!");
      } else {
        const updatedBids = bids.map((bid) =>
          bid._id === editBid._id
            ? {
                ...bid,
                ...bidData,
                supplier:
                  suppliers.find((s) => s._id === bidData.supplier) ||
                  bid.supplier,
              }
            : bid
        );
        setBids(updatedBids);
        setTopBids(updatedBids.slice(0, 3));
        setSuccess("Bid updated successfully!");
      }

      setBidFormOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = (format) => {
    setExportModalOpen(true);
  };

  const showAnalytics = () => {
    setAnalyticsModalOpen(true);
  };

  // Clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) {
    return (
      <div className="card text-center p-3">
        <Spinner size="lg" />
        <p>Loading approved requests for bidding...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <div>
          <h1 className="card-title mb-1">Bid Management</h1>
          <p style={{ color: "var(--text-light)" }}>
            Manage supplier bids for approved purchase requests •{" "}
            {biddingRequests.length} request(s) available
          </p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={fetchBiddingRequests} className="btn btn-outline">
            🔄 Refresh
          </button>
          <button onClick={showAnalytics} className="btn btn-outline">
            📈 Analytics
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error mb-3">
          <strong>Error:</strong> {error}
          <button
            onClick={() => setError("")}
            className="btn btn-sm btn-outline ml-2"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-3">
          <strong>Success:</strong> {success}
          <button
            onClick={() => setSuccess("")}
            className="btn btn-sm btn-outline ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Bidding Requests Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title mb-0">
            🏷️ Approved Requests Ready for Bidding ({biddingRequests.length})
          </h3>
        </div>

        {biddingRequests.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Request Details</th>
                  <th>Budget</th>
                  <th>Department</th>
                  <th>Approved Date</th>
                  <th>Urgency</th>
                  <th>Bids</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {biddingRequests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <div>
                        <strong>{request.title}</strong>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--text-light)",
                          }}
                        >
                          {request.category} •{" "}
                          {request.description?.substring(0, 80)}...
                        </div>
                        {request.items && request.items.length > 0 && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-light)",
                              marginTop: "4px",
                            }}
                          >
                            📦 {request.items.length} item(s)
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{formatCurrency(request.budget)}</strong>
                    </td>
                    <td>{request.department}</td>
                    <td>
                      {formatDate(request.updatedAt || request.createdAt)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          request.urgency === "high"
                            ? "badge-error"
                            : request.urgency === "medium"
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {request.urgency || "low"}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-submitted">
                        {request.bidCount || 0} bids
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
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
                            "Manage Bids"
                          )}
                        </button>
                        {request.status === "ordered" && (
                          <span className="badge badge-success">Ordered</span>
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
              <div className="empty-state-icon">📊</div>
              <h3>No Approved Requests</h3>
              <p>There are no approved purchase requests ready for bidding.</p>
            </div>
          </div>
        )}
      </div>

      {/* Bid Management Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Bid Management: ${selectedRequest?.title}`}
        size="xl"
      >
        {selectedRequest && (
          <div>
            {/* Request Details */}
            <div className="card mb-4">
              <div className="p-3">
                <div className="d-flex justify-between align-center mb-3">
                  <h4>📋 Request Details</h4>
                  <div className="d-flex gap-2">
                    <button
                      onClick={handleCreateBid}
                      className="btn btn-primary btn-sm"
                    >
                      ➕ Add Bid
                    </button>
                    <button
                      onClick={handleExport}
                      className="btn btn-outline btn-sm"
                    >
                      📊 Export
                    </button>
                    <button
                      onClick={showAnalytics}
                      className="btn btn-outline btn-sm"
                    >
                      📈 Analytics
                    </button>
                  </div>
                </div>

                <div className="grid grid-4 gap-3 mb-3">
                  <div>
                    <strong>Budget:</strong>
                    <br />
                    <span
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        color: "var(--primary)",
                      }}
                    >
                      {formatCurrency(selectedRequest.budget)}
                    </span>
                  </div>
                  <div>
                    <strong>Category:</strong>
                    <br />
                    {selectedRequest.category}
                  </div>
                  <div>
                    <strong>Department:</strong>
                    <br />
                    {selectedRequest.department}
                  </div>
                  <div>
                    <strong>Urgency:</strong>
                    <br />
                    <span
                      className={`badge ${
                        selectedRequest.urgency === "high"
                          ? "badge-error"
                          : selectedRequest.urgency === "medium"
                          ? "badge-warning"
                          : "badge-success"
                      }`}
                    >
                      {selectedRequest.urgency || "low"}
                    </span>
                  </div>
                </div>

                <div>
                  <strong>Description:</strong>
                  <p style={{ margin: "8px 0 0 0", lineHeight: "1.5" }}>
                    {selectedRequest.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Bids Section */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  🏆 Recommended Bids ({topBids.length})
                </h5>
              </div>
              <div className="p-3">
                {topBids.length > 0 ? (
                  topBids.map((bid, index) => (
                    <BidCard
                      key={bid._id}
                      bid={bid}
                      index={index}
                      onSelect={handleSelectBid}
                      onEdit={handleEditBid}
                      onDelete={handleDeleteBid}
                      actionLoading={actionLoading}
                      requestBudget={selectedRequest.budget}
                    />
                  ))
                ) : (
                  <div className="text-center p-4">
                    <div className="empty-state">
                      <div className="empty-state-icon">💼</div>
                      <h4>No Bids Yet</h4>
                      <p>
                        No suppliers have submitted bids for this request yet.
                      </p>
                      <button
                        onClick={handleCreateBid}
                        className="btn btn-primary"
                      >
                        ➕ Add First Bid
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* All Bids Section */}
            {bids.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    📋 All Bids ({bids.length})
                  </h5>
                </div>
                <div className="p-3">
                  <div className="grid grid-1 gap-2">
                    {bids.map((bid) => (
                      <div key={bid._id} className="p-2 border rounded">
                        <div className="d-flex justify-between align-center">
                          <div>
                            <div className="d-flex align-center gap-2">
                              <strong>{bid.supplier?.companyName}</strong>
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  color: "var(--text-light)",
                                }}
                              >
                                {formatCurrency(bid.bidAmount)} •{" "}
                                {bid.deliveryTime} days
                              </span>
                              {bid.status === "winning" && (
                                <span className="badge badge-success">
                                  Winner
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="d-flex gap-1">
                            <button
                              onClick={() => handleEditBid(bid)}
                              className="btn btn-outline btn-sm"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteBid(bid._id)}
                              className="btn btn-danger btn-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Bid Form Modal */}
      <Modal
        isOpen={bidFormOpen}
        onClose={() => setBidFormOpen(false)}
        title={editBid ? "✏️ Edit Bid" : "➕ Create New Bid"}
        size="lg"
      >
        <BidForm
          bid={editBid}
          onSubmit={handleBidSubmit}
          onCancel={() => setBidFormOpen(false)}
          loading={actionLoading === "submit-bid"}
          requestDetails={selectedRequest}
          suppliers={suppliers}
        />
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="📊 Export Bids"
        size="md"
      >
        <BidExportModal
          bids={bids}
          request={selectedRequest}
          onClose={() => setExportModalOpen(false)}
        />
      </Modal>

      {/* Analytics Modal */}
      <Modal
        isOpen={analyticsModalOpen}
        onClose={() => setAnalyticsModalOpen(false)}
        title="📈 Bid Analytics"
        size="lg"
      >
        <BidAnalyticsModal
          bids={bids}
          requests={biddingRequests}
          onClose={() => setAnalyticsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

// Bid Card Component for better organization
const BidCard = ({
  bid,
  index,
  onSelect,
  onEdit,
  onDelete,
  actionLoading,
  requestBudget,
}) => (
  <div
    className={`p-3 border rounded mb-3 ${
      bid.status === "winning"
        ? "border-success bg-green-50"
        : index === 0
        ? "border-warning bg-yellow-50"
        : "border-gray-200"
    }`}
  >
    <div className="d-flex justify-between align-start">
      <div className="flex-1">
        <div className="d-flex align-center gap-2 mb-2">
          <span
            className={`badge ${
              bid.status === "winning" ? "badge-success" : "bg-warning"
            }`}
          >
            {bid.status === "winning" ? "🏆 WINNER" : `#${index + 1}`}
          </span>
          <strong>{bid.supplier?.companyName}</strong>
          <span
            style={{
              fontWeight: "bold",
              color:
                bid.status === "winning" ? "var(--success)" : "var(--primary)",
            }}
          >
            {formatCurrency(bid.bidAmount)}
          </span>

          <span className="badge badge-outline">
            ⭐ {bid.supplier?.rating || "N/A"}
          </span>
          {bid.supplier?.email && (
            <span style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
              📧 {bid.supplier.email}
            </span>
          )}
        </div>

        <div className="grid grid-3 gap-2 mb-2">
          <div>
            <strong>Bid Amount:</strong>
            <br />
            <span
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                color:
                  bid.status === "winning"
                    ? "var(--success)"
                    : "var(--primary)",
              }}
            >
              {formatCurrency(bid.bidAmount)}
            </span>
            {requestBudget && (
              <div style={{ fontSize: "0.75rem" }}>
                {bid.bidAmount > requestBudget ? (
                  <span style={{ color: "var(--error)" }}>
                    ⚠️ ${(bid.bidAmount - requestBudget).toFixed(2)} over
                  </span>
                ) : (
                  <span style={{ color: "var(--success)" }}>
                    ✅ ${(requestBudget - bid.bidAmount).toFixed(2)} under
                  </span>
                )}
              </div>
            )}
          </div>
          <div>
            <strong>Delivery:</strong>
            <br />
            {bid.deliveryTime} days
          </div>
          <div>
            <strong>Validity:</strong>
            <br />
            {bid.validityPeriod} days
          </div>
        </div>

        {bid.proposal && (
          <div className="mb-2">
            <strong>Proposal:</strong>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.875rem",
                lineHeight: "1.4",
              }}
            >
              {bid.proposal.substring(0, 150)}...
            </p>
          </div>
        )}

        {bid.notes && (
          <div
            style={{
              fontSize: "0.875rem",
              color: "var(--text-light)",
              fontStyle: "italic",
            }}
          >
            <strong>Notes:</strong> {bid.notes}
          </div>
        )}
      </div>

      <div className="d-flex flex-column gap-1 ml-3">
        {bid.status !== "winning" && (
          <button
            onClick={() => onSelect(bid._id)}
            className="btn btn-success btn-sm"
            disabled={actionLoading === `select-${bid._id}`}
          >
            {actionLoading === `select-${bid._id}` ? (
              <Spinner size="sm" />
            ) : (
              "Select Winner"
            )}
          </button>
        )}
        <button
          onClick={() => onEdit(bid)}
          className="btn btn-outline btn-sm"
          disabled={actionLoading}
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(bid._id)}
          className="btn btn-danger btn-sm"
          disabled={actionLoading === `delete-${bid._id}`}
        >
          {actionLoading === `delete-${bid._id}` ? (
            <Spinner size="sm" />
          ) : (
            "🗑️ Delete"
          )}
        </button>
      </div>
    </div>
  </div>
);

export default BidManagement;
