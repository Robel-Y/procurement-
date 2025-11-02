const mongoose = require("mongoose");

const centralSupplierSchema = new mongoose.Schema(
  {
    // Basic Info
    companyName: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    phone: String,

    // Location
    location: {
      city: String,
      country: { type: String, default: "Ethiopia" },
    },

    // What they supply
    categories: [{ type: String, required: true }],

    // MVP AI Scoring
    rating: { type: Number, default: 0, min: 0, max: 5 },
    deliveryScore: { type: Number, default: 0, min: 0, max: 10 },
    priceScore: { type: Number, default: 0, min: 0, max: 10 },

    // Verification
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CentralSupplier", centralSupplierSchema);
