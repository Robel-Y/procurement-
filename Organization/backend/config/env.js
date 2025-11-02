const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/procurement_system",
  JWT_SECRET:
    process.env.JWT_SECRET || "fallback_jwt_secret_change_in_production_2024",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
};
