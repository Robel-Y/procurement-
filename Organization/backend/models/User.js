const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Role (MVP: 3 types only)
    role: {
      type: String,
      enum: ["admin", "approver", "requester"],
      required: true,
    },

    // Department (for requesters & approvers)
    department: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
    },

    // Approval Limit (for approvers)
    approvalLimit: {
      type: Number,
      default: 0,
      required: function () {
        return this.role === "approver";
      },
    },

    // Status
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
