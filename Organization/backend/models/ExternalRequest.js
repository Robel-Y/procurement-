const mongoose = require("mongoose");

const ExternalRequestSchema = new mongoose.Schema(
  {
    purchaseRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      required: true,
    },
    externalSystemId: {
      type: String,
      required: false, // Changed to false because it might fail
    },
    externalSystemName: {
      type: String,
      default: "procurement_system",
    },
    payload: {
      type: Object,
      required: true,
    },
    response: {
      type: Object,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "retried"],
      default: "pending",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastAttemptAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ExternalRequest", ExternalRequestSchema);
