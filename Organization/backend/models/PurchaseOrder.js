const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    // Link to Purchase Request
    purchaseRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      required: true,
    },

    // Supplier Info
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CentralSupplier",
      required: true,
    },

    // Order Details
    items: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
    totalAmount: { type: Number, required: true },

    // Delivery & Status
    deliveryDate: Date,
    status: {
      type: String,
      enum: ["created", "sent", "confirmed", "delivered", "cancelled"],
      default: "created",
    },

    // Tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
