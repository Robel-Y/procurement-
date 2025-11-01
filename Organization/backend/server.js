const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Config
const connectDB = require("./config/database");
const env = require("./config/env");

// Route imports
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const purchaseRequestRoutes = require("./routes/purchaseRequests");
const purchaseOrderRoutes = require("./routes/purchaseOrders");
const supplierRoutes = require("./routes/centralSuppliers");

// Middleware imports
const errorHandler = require("./middleware/error");

// Initialize express
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Procurement System API is running",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/purchase-requests", purchaseRequestRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/suppliers", supplierRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle unhandled routes
app.all("*", (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// Start server
const PORT = env.PORT;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
