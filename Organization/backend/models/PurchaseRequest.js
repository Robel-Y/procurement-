const mongoose = require("mongoose");

const purchaseRequestSchema = new mongoose.Schema(
  {
    // Basic Request Info
    title: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    budget: { type: Number, required: true, min: 0 },
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // Requester Info
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
   department: { type: String, ref: "Department", required: true },

    // Approval Workflow
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected", "ordered"],
      default: "draft",
    },
    currentApprover: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalHistory: [
      {
        approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["approved", "rejected"] },
        comments: String,
        date: { type: Date, default: Date.now },
      },
    ],

    // AI Suggestions (MVP Feature)
    suggestedSuppliers: [
      {
        supplier: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CentralSupplier",
        },
        score: { type: Number, default: 0 },

        reason: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseRequest", purchaseRequestSchema);
