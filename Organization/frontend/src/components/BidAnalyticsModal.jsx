// src/components/BidAnalyticsModal.jsx
import React from "react";
import { formatCurrency } from "../utils/helpers";

const BidAnalyticsModal = ({ bids, requests, onClose }) => {
  const totalBids = bids.length;
  const totalRequests = requests.length;
  const averageBidsPerRequest =
    totalRequests > 0 ? (totalBids / totalRequests).toFixed(1) : 0;

  const winningBids = bids.filter((bid) => bid.status === "winning");
  const averageBidAmount =
    bids.length > 0
      ? bids.reduce((sum, bid) => sum + parseFloat(bid.bidAmount), 0) /
        bids.length
      : 0;

  const suppliers = [
    ...new Set(bids.map((bid) => bid.supplier?.companyName).filter(Boolean)),
  ];

  return (
    <div>
      <div className="card mb-3">
        <div className="p-3">
          <h6>📈 Bid Analytics Overview</h6>
          <p style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
            Comprehensive analysis of bidding activities
          </p>
        </div>
      </div>

      <div className="grid grid-3 gap-3 mb-4">
        <div className="card text-center">
          <div className="p-2">
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              {totalBids}
            </div>
            <div>Total Bids</div>
          </div>
        </div>

        <div className="card text-center">
          <div className="p-2">
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "var(--success)",
              }}
            >
              {winningBids.length}
            </div>
            <div>Winning Bids</div>
          </div>
        </div>

        <div className="card text-center">
          <div className="p-2">
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "var(--warning)",
              }}
            >
              {averageBidsPerRequest}
            </div>
            <div>Avg per Request</div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="p-3">
          <h6>Supplier Participation</h6>
          <p>Total suppliers: {suppliers.length}</p>
          <div style={{ fontSize: "0.875rem" }}>
            {suppliers.map((supplier, index) => (
              <div key={index} className="d-flex justify-between">
                <span>{supplier}</span>
                <span>
                  {
                    bids.filter((bid) => bid.supplier?.companyName === supplier)
                      .length
                  }{" "}
                  bids
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-3">
          <h6>Financial Overview</h6>
          <div style={{ fontSize: "0.875rem" }}>
            <div className="d-flex justify-between">
              <span>Average Bid Amount:</span>
              <span>{formatCurrency(averageBidAmount)}</span>
            </div>
            <div className="d-flex justify-between">
              <span>Total Bid Value:</span>
              <span>
                {formatCurrency(
                  bids.reduce((sum, bid) => sum + parseFloat(bid.bidAmount), 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-actions mt-3">
        <button onClick={onClose} className="btn btn-outline">
          Close
        </button>
      </div>
    </div>
  );
};

export default BidAnalyticsModal;
