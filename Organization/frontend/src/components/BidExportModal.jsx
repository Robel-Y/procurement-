// src/components/BidExportModal.jsx
import React from "react";
import { formatCurrency, formatDate } from "../utils/helpers";

const BidExportModal = ({ bids, request, onClose }) => {
  const exportToPDF = () => {
    // Simulate PDF export
    const content = `
      BID REPORT - ${request?.title}
      Generated on: ${new Date().toLocaleDateString()}
      
      Request Details:
      - Title: ${request?.title}
      - Budget: ${formatCurrency(request?.budget)}
      - Category: ${request?.category}
      - Department: ${request?.department}
      
      Bids Summary (${bids.length} bids):
      ${bids
        .map(
          (bid, index) => `
      ${index + 1}. ${bid.supplier?.companyName}
         Amount: ${formatCurrency(bid.bidAmount)}
         Delivery: ${bid.deliveryTime} days
         Status: ${bid.status}
      `
        )
        .join("")}
    `;

    alert(
      "PDF export functionality would generate a formatted PDF file.\n\nContent:\n" +
        content
    );
    onClose();
  };

  const exportToCSV = () => {
    const headers = [
      "Supplier",
      "Bid Amount",
      "Delivery Time",
      "Status",
      "Proposal",
    ];
    const csvContent = [
      headers,
      ...bids.map((bid) => [
        bid.supplier?.companyName,
        bid.bidAmount,
        bid.deliveryTime,
        bid.status,
        `"${bid.proposal?.replace(/"/g, '""')}"`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bids-${request?.title}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    onClose();
  };

  const exportToExcel = () => {
    alert("Excel export functionality would be implemented here");
    onClose();
  };

  return (
    <div>
      <div className="card mb-3">
        <div className="p-3">
          <h6>Export Options for: {request?.title}</h6>
          <p style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>
            Total bids: {bids.length} • Generated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-1 gap-3">
        <button onClick={exportToPDF} className="btn btn-danger">
          📄 Export as PDF
        </button>
        <button onClick={exportToCSV} className="btn btn-success">
          📊 Export as CSV
        </button>
        <button onClick={exportToExcel} className="btn btn-primary">
          📈 Export as Excel
        </button>
      </div>

      <div className="modal-actions mt-3">
        <button onClick={onClose} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BidExportModal;
